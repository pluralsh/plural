import { createContext, useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { Navigate, useLocation } from 'react-router-dom'
import { Box } from 'grommet'

import { useIntercom } from 'react-use-intercom'

import { growthbook } from 'helpers/growthbook'

import { ME_Q } from '../users/queries'
import { setPreviousUserData, setToken, wipeToken } from '../../helpers/authentication'
import { useNotificationSubscription } from '../incidents/Notifications'
import { LoopingLogo } from '../utils/AnimatedLogo'

// const POLL_INTERVAL=30000
export const CurrentUserContext = createContext({})
export const PluralConfigurationContext = createContext({})

function LoadingSpinner() {
  const [showLogo, setShowLogo] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return showLogo && <LoopingLogo />
}

export default function CurrentUser({ children }) {
  const { loading, error, data } = useQuery(ME_Q)

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
    <CurrentUserContext.Provider value={me}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export function handlePreviousUserClick({ jwt }) {
  setToken(jwt)
  setPreviousUserData(null)
  window.location.reload()
}

export function PluralProvider({ children }) {
  const location = useLocation()
  // TODO: Revert to 60s
  const { loading, error, data } = useQuery(ME_Q, { pollInterval: 5000 })
  const { boot, update } = useIntercom()

  useNotificationSubscription()

  useEffect(() => {
    if (!data?.me) return
    const { me } = data

    boot({ name: me.name, email: me.email, user_id: me.id })
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

  const { me, configuration } = data

  return (
    <PluralConfigurationContext.Provider value={configuration}>
      <CurrentUserContext.Provider value={me}>
        {children}
      </CurrentUserContext.Provider>
    </PluralConfigurationContext.Provider>
  )
}
