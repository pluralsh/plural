import { useQuery } from '@apollo/client'
import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { ConsoleInstancesContextProvider } from '../../contexts/ConsoleInstancesContext'

import { CurrentUserContextProvider } from '../../contexts/CurrentUserContext'
import PluralConfigurationContext from '../../contexts/PluralConfigurationContext'
import { useMeQuery, useSubscriptionQuery } from '../../generated/graphql'
import {
  setPreviousUserData,
  setToken,
  wipeToken,
} from '../../helpers/authentication'
import { useNotificationSubscription } from '../../hooks/useNotificationSubscription'
import BillingPlatformPlansProvider from '../account/billing/BillingPlatformPlansProvider'
import BillingSubscriptionProvider from '../account/billing/BillingSubscriptionProvider'
import { PLATFORM_PLANS_QUERY } from '../account/billing/queries'
import LoadingIndicator from '../utils/LoadingIndicator'
import { getLoginUrlWithReturn } from 'components/users/utils'

export function handlePreviousUserClick({ jwt }: any) {
  setToken(jwt)
  setPreviousUserData(null)
  window.location.reload()
}

export function PluralProvider({ children }: any) {
  const location = useLocation()

  const { loading, error, data } = useMeQuery({
    fetchPolicy: 'network-only',
    pollInterval: 60_000,
  })

  // Below queries were extracted from providers to use less loading animations.
  // This should be handled by parent Suspense element once Apollo Client will support it.
  //
  // See:
  // - https://react.dev/reference/react/Suspense
  // - https://github.com/apollographql/apollo-client/issues/9627
  // - https://github.com/apollographql/apollo-client/issues/10231
  const {
    data: platformPlansData,
    loading: platformPlansLoading,
    error: platformPlansError,
  } = useQuery(PLATFORM_PLANS_QUERY)

  const {
    data: subscriptionData,
    loading: subscriptionLoading,
    error: subscriptionError,
    refetch: subscriptionRefetch,
  } = useSubscriptionQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    pollInterval: 60_000,
  })

  useNotificationSubscription()

  if (
    (!data && loading) ||
    (!platformPlansData && platformPlansLoading) ||
    (!subscriptionData && subscriptionLoading)
  )
    return <LoadingIndicator />

  if (error || !data?.me?.id) {
    wipeToken()

    return <Navigate to={getLoginUrlWithReturn()} />
  }

  const { configuration } = data

  return (
    <PluralConfigurationContext.Provider value={configuration}>
      <CurrentUserContextProvider value={data.me}>
        <BillingPlatformPlansProvider
          data={platformPlansData}
          error={platformPlansError}
        >
          <BillingSubscriptionProvider
            data={subscriptionData}
            error={subscriptionError}
            refetch={subscriptionRefetch}
          >
            <ConsoleInstancesContextProvider>
              {children}
            </ConsoleInstancesContextProvider>
          </BillingSubscriptionProvider>
        </BillingPlatformPlansProvider>
      </CurrentUserContextProvider>
    </PluralConfigurationContext.Provider>
  )
}
