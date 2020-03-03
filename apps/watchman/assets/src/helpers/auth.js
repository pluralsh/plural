import Cookies from 'universal-cookie'

export const AUTH_TOKEN = 'watchman-token'
const COOKIE_NAME = 'grafana_token'

export function wipeToken() {
  const cookies = new Cookies()
  cookies.remove(COOKIE_NAME)
  localStorage.removeItem(AUTH_TOKEN)
}

export function fetchToken() {
  return localStorage.getItem(AUTH_TOKEN)
}

export function setToken(token) {
  const cookies = new Cookies();
  cookies.set(COOKIE_NAME, token, { path: '/', expires: expiry() })
  localStorage.setItem(AUTH_TOKEN, token)
}

const expiry = () => {
  const d = new Date()
  d.setTime(d.getTime() + 1000 * 60 * 60 * 1000)
  return d
}