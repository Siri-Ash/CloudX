// Thin fetch wrapper around the existing FastAPI backend.
// Every function here talks to the real API — nothing here is mocked.
//
// This is also the single place that knows how the JWT is stored, so that
// buckets.js, files.js, auth.js, sharing.js, and SessionContext never have
// to duplicate token/localStorage logic.

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
const SESSION_KEY = 'cloudx_session'

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

// ---------------------------------------------------------------------------
// Token storage — the only place that touches localStorage for auth.
// ---------------------------------------------------------------------------

export function getAuthToken() {
  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)?.accessToken || null
  } catch {
    return null
  }
}

export function setAuthToken(accessToken, tokenType = 'bearer') {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken, tokenType }))
}

export function clearAuthToken() {
  localStorage.removeItem(SESSION_KEY)
}

function authHeader() {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// A JWT that's missing/expired/invalid fails inside FastAPI's
// get_current_user() dependency, which always returns one of these exact
// messages. A wrong *bucket* password also returns 401, but with the
// message "Wrong password" — so we only treat the token-shaped messages
// below as "the user's session is no longer valid."
const AUTH_TOKEN_ERROR_PATTERN = /invalid token|invalid or expired token|user not found/i

function isAuthTokenError(status, body) {
  return status === 401 && typeof body?.detail === 'string' && AUTH_TOKEN_ERROR_PATTERN.test(body.detail)
}

// Turns backend error shapes (FastAPI's {detail: "..."} or {detail: [...]})
// into a single human-readable message.
function extractErrorMessage(status, body) {
  if (isAuthTokenError(status, body)) return 'Your session has expired. Please sign in again.'
  if (status === 401) {
    if (typeof body?.detail === 'string') return body.detail
    return 'That password is incorrect.'
  }
  if (status === 404) return 'We couldn\u2019t find that. It may have been deleted.'
  if (status === 422) {
    if (Array.isArray(body?.detail)) {
      const first = body.detail[0]
      return first?.msg ? `Check the form: ${first.msg}` : 'Some fields need attention.'
    }
    return 'Some fields need attention.'
  }
  if (status >= 500) return 'The server ran into a problem. Please try again.'
  if (typeof body?.detail === 'string') return body.detail
  return 'Something went wrong. Please try again.'
}

async function parseBody(res) {
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      return await res.json()
    } catch {
      return null
    }
  }
  return null
}

// If the JWT itself was rejected, clear it and let the rest of the app know
// (SessionContext listens for this and logs the user out / redirects).
// This never fires for a wrong *bucket* password — see isAuthTokenError above.
function handleUnauthorized(status, body) {
  if (isAuthTokenError(status, body)) {
    clearAuthToken()
    window.dispatchEvent(new CustomEvent('cloudx:session-expired'))
  }
}

async function handleErrorResponse(res) {
  const parsed = await parseBody(res)
  handleUnauthorized(res.status, parsed)
  throw new ApiError(extractErrorMessage(res.status, parsed), res.status, parsed)
}

/**
 * request() — JSON-in / JSON-out helper.
 * path: e.g. "/buckets"
 * options.body: plain object, will be JSON-stringified
 */
export async function request(path, options = {}) {
  const { method = 'GET', body, headers, signal } = options

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...authHeader(),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    throw new ApiError(`Can\u2019t reach the CloudX server at ${API_URL}. Is it running?`, 0, err)
  }

  if (!res.ok) await handleErrorResponse(res)

  return parseBody(res)
}

/**
 * requestMultipart() — for file uploads.
 */
export async function requestMultipart(path, formData, options = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method || 'POST',
      headers: { ...authHeader() },
      body: formData,
      signal: options.signal,
    })
  } catch (err) {
    throw new ApiError(`Can\u2019t reach the CloudX server at ${API_URL}. Is it running?`, 0, err)
  }

  if (!res.ok) await handleErrorResponse(res)

  return parseBody(res)
}

/**
 * requestBlob() — for file downloads, returns the raw Response so callers
 * can read filename headers and stream the blob.
 */
export async function requestBlob(path, options = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method || 'GET',
      headers: { ...authHeader() },
    })
  } catch (err) {
    throw new ApiError(`Can\u2019t reach the CloudX server at ${API_URL}. Is it running?`, 0, err)
  }

  if (!res.ok) await handleErrorResponse(res)

  return res
}

export { API_URL }
