import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'

import PluralConfigurationContext from '../../contexts/PluralConfigurationContext'
import { useMeQuery } from '../../generated/graphql'
import { CurrentUserContextProvider } from '../../contexts/CurrentUserContext'
import { growthbook } from '../../helpers/growthbook'
import { setPreviousUserData, setToken, wipeToken } from '../../helpers/authentication'
import BillingSubscriptionProvider from '../account/billing/BillingSubscriptionProvider'
import BillingPlatformPlansProvider from '../account/billing/BillingPlatformPlansProvider'
import { useNotificationSubscription } from '../../hooks/useNotificationSubscription'
import LoadingIndicator from '../utils/LoadingIndicator'

export function handlePreviousUserClick({ jwt }: any) {
  setToken(jwt)
  setPreviousUserData(null)
  window.location.reload()
}

export function PluralProvider({ children }: any) {
  const location = useLocation()
  const {
    loading, error, data,
  } = useMeQuery({ pollInterval: 60000, fetchPolicy: 'network-only' })
  const { boot, update } = useIntercom()

  useNotificationSubscription()

  useEffect(() => {
    if (!data?.me) return
    const { me } = data

    boot({ name: me.name, email: me.email, userId: me.id })
    growthbook.setAttributes({ company: me.account.name, id: me.id, email: me.email })
  }, [data, boot])

  useEffect(() => {
    if (data && data.me) update()
  }, [location, data, update])

  if (loading) return <LoadingIndicator />

  if (error || !data?.me?.id) {
    wipeToken()

    return (<Navigate to="/login" />)
  }

  const { configuration } = data

  return (
    <PluralConfigurationContext.Provider value={configuration}>
      <CurrentUserContextProvider value={data.me}>
        <BillingPlatformPlansProvider>
          <BillingSubscriptionProvider>
            {children}
          </BillingSubscriptionProvider>
        </BillingPlatformPlansProvider>
      </CurrentUserContextProvider>
    </PluralConfigurationContext.Provider>
  )
}
