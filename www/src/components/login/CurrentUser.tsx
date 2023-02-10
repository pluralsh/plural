import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box } from 'grommet'

import { useIntercom } from 'react-use-intercom'

import PluralConfigurationContext from '../../contexts/PluralConfigurationContext'
import { User, useMeQuery } from '../../generated/graphql'

import CurrentUserContext from '../../contexts/CurrentUserContext'

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

  const { me } = data as { me: User }

  return (
    <CurrentUserContext.Provider value={me}>
      {children}
    </CurrentUserContext.Provider>
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
    loading, error, data, refetch,
  } = useMeQuery({ pollInterval: 60000, fetchPolicy: 'network-only' })
  const { boot, update } = useIntercom()
  const userContextValue = useMemo(() => ({ me: data?.me, refetch }), [data, refetch])

  let userContext: User

  if (userContextValue.me) {
    userContext = userContextValue.me as User
  }
  else {
    userContext = {
      id: '',
      name: '',
      email: '',
      account: { id: '' },
    }
  }

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
      <CurrentUserContext.Provider value={userContext}>
        <BillingPlatformPlansProvider>
          <BillingSubscriptionProvider>
            {children}
          </BillingSubscriptionProvider>
        </BillingPlatformPlansProvider>
      </CurrentUserContext.Provider>
    </PluralConfigurationContext.Provider>
  )
}
