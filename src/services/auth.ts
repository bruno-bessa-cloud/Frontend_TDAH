import api from './api'

interface RegisterDto {
  name: string
  email: string
  password: string
}

export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password })
  const token: string = response.data?.token
  const user = response.data?.user
  if (token) {
    localStorage.setItem('token', token)
  }
  return { token, user }
}

export async function register(payload: RegisterDto) {
  const response = await api.post('/auth/register', payload)
  const token: string = response.data?.token
  const user = response.data?.user
  return { token, user }
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  try {
    window.location.href = '/login'
  } catch {
    return
  }
}

export async function getMe() {
  try {
    const response = await api.get('/auth/me')
    return response.data
  } catch {
    return null
  }
}
