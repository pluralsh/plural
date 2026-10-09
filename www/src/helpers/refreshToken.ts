import { FetchResult, Observable } from '@apollo/client'
import { NetworkError } from '@apollo/client/errors'
import { ErrorHandler } from '@apollo/client/link/error'
import { RefreshDocument, RefreshQuery } from '../generated/graphql'

import { fetchRefreshToken, setRefreshToken, setToken } from './authentication'
import { clearLocalStorage } from './localStorage'
import { getLoginUrlWithReturn } from '../components/users/utils'
import { authlessClient } from './authlessClient'

let refreshInFlight: Promise<string | undefined> | undefined

const performTokenRefresh = async () => {
  const refreshToken = fetchRefreshToken()
  const refreshResolverResponse = await authlessClient.query<RefreshQuery>({
    query: RefreshDocument,
    variables: { token: refreshToken },
    fetchPolicy: 'no-cache',
  })

  const user = refreshResolverResponse?.data?.refresh
  if (user?.refreshToken?.token) {
    setRefreshToken(user.refreshToken.token)
  }

  return user?.jwt ?? undefined
}

export const getRefreshedToken = () => {
  if (!refreshInFlight) {
    refreshInFlight = performTokenRefresh().finally(() => {
      refreshInFlight = undefined
    })
  }

  return refreshInFlight
}

export const onErrorHandler: ErrorHandler = ({
  graphQLErrors,
  networkError,
  operation,
  forward,
}) => {
  const refreshToken = fetchRefreshToken()
  const is401 = networkError && (networkError as any).statusCode === 401
  const isUnauthenticated = graphQLErrors?.some?.(
    (err) =>
      err.message === 'unauthenticated' || err.message === 'invalid_token'
  )

  if (refreshToken && (is401 || isUnauthenticated)) {
    if (operation.operationName === 'Refresh') {
      return
    }

    return new Observable<FetchResult>((observer) => {
      ;(async () => {
        try {
          const jwt = await getRefreshedToken()

          if (!jwt) {
            logoutToLogin()
          } else {
            setToken(jwt)
          }

          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              authorization: `Bearer ${jwt}`,
            },
          }))
          const subscriber = {
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          }

          forward(operation).subscribe(subscriber)
        } catch (err) {
          observer.error(err)
          if (
            (err as { networkError?: NetworkError } | null)?.networkError
              ?.message === 'Failed to fetch'
          ) {
            return
          }
          logoutToLogin()
        }
      })()
    })
  }

  if (is401) {
    logoutToLogin()
  }
}

export function logoutToLogin() {
  clearLocalStorage()
  window.location.href = getLoginUrlWithReturn()
}
