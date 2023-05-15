import { useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { Navigate, useLocation } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'

import PluralConfigurationContext from '../../contexts/PluralConfigurationContext'
import { useMeQuery, useSubscriptionQuery } from '../../generated/graphql'
import { CurrentUserContextProvider } from '../../contexts/CurrentUserContext'
import { growthbook } from '../../helpers/growthbook'
import {
  setPreviousUserData,
  setToken,
  wipeToken,
} from '../../helpers/authentication'
import BillingSubscriptionProvider from '../account/billing/BillingSubscriptionProvider'
import BillingPlatformPlansProvider from '../account/billing/BillingPlatformPlansProvider'
import { useNotificationSubscription } from '../../hooks/useNotificationSubscription'
import LoadingIndicator from '../utils/LoadingIndicator'
import { PLATFORM_PLANS_QUERY } from '../account/billing/queries'
import { ClustersContextProvider } from '../../contexts/ClustersContext'

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

  const { boot, update } = useIntercom()

  useNotificationSubscription()

  useEffect(() => {
    if (!data?.me) return
    const { me } = data

    boot({ name: me.name, email: me.email, userId: me.id })
    growthbook.setAttributes({
      company: me.account.name,
      id: me.id,
      email: me.email,
    })
  }, [data, boot])

  useEffect(() => {
    if (data && data.me) update()
  }, [location, data, update])

  if (
    (!data && loading) ||
    (!platformPlansData && platformPlansLoading) ||
    (!subscriptionData && subscriptionLoading)
  )
    return <LoadingIndicator />

  if (error || !data?.me?.id) {
    wipeToken()

    return <Navigate to="/login" />
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
            <ClustersContextProvider>{children}</ClustersContextProvider>
          </BillingSubscriptionProvider>
        </BillingPlatformPlansProvider>
      </CurrentUserContextProvider>
    </PluralConfigurationContext.Provider>
  )
}
