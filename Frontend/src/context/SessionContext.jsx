import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { getAuthToken, setAuthToken, clearAuthToken } from '../api/client'
import { getCurrentUser } from '../api/auth'

// Real authentication state (JWT-backed) plus, separately, which buckets
// the user has unlocked with the correct *bucket* password during this
// browser session. Bucket passwords are independent of the account
// password/JWT — opening a bucket always still requires POST
// /buckets/{id}/open, even while logged in.

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null)
  // 'loading' while we validate a stored token on first mount, so
  // ProtectedRoute doesn't flash a redirect before we know the answer.
  const [status, setStatus] = useState('loading')
  const [unlockedBuckets, setUnlockedBuckets] = useState(() => new Set())

  const clearAll = useCallback(() => {
    clearAuthToken()
    setUser(null)
    setUnlockedBuckets(new Set())
    setStatus('unauthenticated')
  }, [])

  // On first load, if a token is already stored, validate it against
  // GET /users/me instead of trusting it blindly.
  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setStatus('unauthenticated')
      return
    }
    getCurrentUser()
      .then((me) => {
        setUser(me)
        setStatus('authenticated')
      })
      .catch(() => {
        // Token was rejected (expired/invalid) — client.js already cleared it.
        setUser(null)
        setStatus('unauthenticated')
      })
  }, [])

  // client.js dispatches this if any API call comes back with an
  // invalid/expired token, so the whole app reacts, not just the page
  // that happened to make the failing request.
  useEffect(() => {
    const onExpired = () => clearAll()
    window.addEventListener('cloudx:session-expired', onExpired)
    return () => window.removeEventListener('cloudx:session-expired', onExpired)
  }, [clearAll])

  // Call after a successful POST /users/login. Stores the JWT, then
  // hydrates the user from /users/me.
  const login = useCallback(async (loginResponse) => {
    setAuthToken(loginResponse.access_token, loginResponse.token_type)
    const me = await getCurrentUser()
    setUser(me)
    setUnlockedBuckets(new Set())
    setStatus('authenticated')
    return me
  }, [])

  const logout = useCallback(() => {
    clearAll()
  }, [clearAll])

  const markUnlocked = useCallback((bucketId) => {
    setUnlockedBuckets((prev) => new Set(prev).add(bucketId))
  }, [])

  const isUnlocked = useCallback((bucketId) => unlockedBuckets.has(bucketId), [unlockedBuckets])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      logout,

      // Bucket-level password unlock (separate from account auth).
      markUnlocked,
      isUnlocked,
    }),
    [user, status, login, logout, markUnlocked, isUnlocked]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
