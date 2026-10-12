import Cookies from 'js-cookie'

import { LocalStorageKeys } from '../constants'

export const REFRESH_TOKEN = 'refresh-token'

export function wipeToken() {
  localStorage.removeItem(LocalStorageKeys.AuthToken)
}

export function fetchToken() {
  return localStorage.getItem(LocalStorageKeys.AuthToken)
}

export function setToken(token: string | null | undefined) {
  if (token) {
    localStorage.setItem(LocalStorageKeys.AuthToken, token)
  } else {
    wipeToken()
  }
}

export function setRefreshToken(token: string | null | undefined) {
  Cookies.set(REFRESH_TOKEN, token || '', {
    path: '/',
    secure: true,
    sameSite: 'strict',
    expires: 30,
  })
}

export function wipeRefreshToken() {
  Cookies.remove(REFRESH_TOKEN, { path: '/' })
}

export function fetchRefreshToken() {
  return Cookies.get(REFRESH_TOKEN)
}

export function setAuthFromUser(
  user?: {
    jwt?: string | null
    refreshToken?: { token?: string | null } | null
  } | null
) {
  if (user?.jwt) setToken(user.jwt)
  if (user?.refreshToken?.token) setRefreshToken(user.refreshToken.token)
}

export function setPreviousUserData(userData) {
  if (userData == null) {
    localStorage.removeItem(LocalStorageKeys.AuthPreviousUserData)

    return
  }
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
  } catch (_error) {
    return null
  }
}
