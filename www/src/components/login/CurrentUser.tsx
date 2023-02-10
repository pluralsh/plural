import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box } from 'grommet'

import { useIntercom } from 'react-use-intercom'

import PluralConfigurationContext from '../../contexts/PluralConfigurationContext'
import { useMeQuery } from '../../generated/graphql'

import { CurrentUserContextProvider } from '../../contexts/CurrentUserContext'

import { growthbook } from '../../helpers/growthbook'

import { setPreviousUserData, setToken, wipeToken } from '../../helpers/authentication'
import { useNotificationSubscription } from '../incidents/Notifications'
import { LoopingLogo } from '../utils/AnimatedLogo'
import BillingSubscriptionProvider from '../account/billing/BillingSubscriptionProvider'
import BillingPlatformPlansProvider from '../account/billing/BillingPlatformPlansProvider'

// const POLL_INTERVAL=30000

function LoadingSpinner() {
  const [showLogo, setShowLogo] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return showLogo ? <LoopingLogo /> : null
}

export default function CurrentUser({ children }: any) {
  const { loading, error, data } = useMeQuery()

  useNotificationSubscription()

  useEffect(() => {
    if (data?.me) {
      const { me } = data

      growthbook.setAttributes({
        id: me.id,
        email: me.email,
        company: me.account.name,
      })
    }
  }, [data])

  if (loading) return (<Box height="100vh"><LoadingSpinner /></Box>)

  if (error || !data?.me?.id) {
    wipeToken()

    return (<Navigate to="/login" />)
  }

  const { me } = data

  return (
    <CurrentUserContextProvider value={me}>
      {children}
    </CurrentUserContextProvider>
  )
}

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

  if (loading) return (<Box height="100vh"><LoadingSpinner /></Box>)

  if (error || !data || !data.me || !data.me.id) {
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
