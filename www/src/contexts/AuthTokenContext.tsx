import { createContext, useContext } from 'react'

import { fetchToken } from '../helpers/authentication'

type AuthTokenContextValue = { token?: string }
export const AuthTokenContext = createContext<AuthTokenContextValue | null>(
  null
)

export const useAuthToken = () =>
  useContext(AuthTokenContext)?.token || fetchToken()
