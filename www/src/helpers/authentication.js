import {AUTH_TOKEN, AUTH_PREVIOUS_USER_DATA} from '../constants'

export function wipeToken() {
  localStorage.removeItem(AUTH_TOKEN)
}

export function fetchToken() {
  return localStorage.getItem(AUTH_TOKEN)
}

export function setToken(token) {
  localStorage.setItem(AUTH_TOKEN, token)
}

export function setPreviousUserData(userData) {
  localStorage.setItem(AUTH_PREVIOUS_USER_DATA, JSON.stringify(userData))
}

export function getPreviousUserData() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_PREVIOUS_USER_DATA)) || null
  }
  catch {
    return null
  }
}
