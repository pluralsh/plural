import { LocalStorageKeys } from '../constants'

export function wipeToken() {
  localStorage.removeItem(LocalStorageKeys.AuthToken)
}

export function fetchToken() {
  return localStorage.getItem(LocalStorageKeys.AuthToken)
}

export function setToken(token) {
  localStorage.setItem(LocalStorageKeys.AuthToken, token)
}

export function setPreviousUserData(userData) {
  localStorage.setItem(
    LocalStorageKeys.AuthPreviousUserData,
    JSON.stringify(userData)
  )
}

export function getPreviousUserData() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(LocalStorageKeys.AuthPreviousUserData) as string
      ) || null
    )
  } catch (error) {
    return null
  }
}
