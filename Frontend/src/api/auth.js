import { request } from './client'

// POST /users/register
export function registerUser({ username, email, password }) {
  return request('/users/register', {
    method: 'POST',
    body: { username, email, password },
  })
}

// POST /users/login  -> { access_token, token_type }
export function loginUser({ email, password }) {
  return request('/users/login', {
    method: 'POST',
    body: { email, password },
  })
}

// GET /users/me  -> { user_id, username, email }
export function getCurrentUser() {
  return request('/users/me')
}
