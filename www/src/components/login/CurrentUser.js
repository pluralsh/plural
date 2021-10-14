import React from 'react'
import {useQuery} from 'react-apollo'
import {Redirect} from 'react-router-dom'
import {Box} from 'grommet'
import {ME_Q} from '../users/queries'
import {wipeToken} from '../../helpers/authentication'
import { useNotificationSubscription } from '../incidents/Notifications'
import { LoopingLogo } from '../utils/AnimatedLogo'

// const POLL_INTERVAL=30000
export const CurrentUserContext = React.createContext({})
export const PluralConfigurationContext = React.createContext({})

export default function CurrentUser({children}) {
  const {loading, error, data} = useQuery(ME_Q)
  useNotificationSubscription()

  if (loading) return (<Box height='100vh'><LoopingLogo/></Box>)

  if (error || !data || !data.me || !data.me.id) {
    wipeToken()
    return (<Redirect to='/login'/>)
  }
  let me = data.me

  return (
    <CurrentUserContext.Provider value={me}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export function PluralProvider({children}) {
  const {loading, error, data} = useQuery(ME_Q, {pollInterval: 60000})
  useNotificationSubscription()

  if (loading) return (<Box height='100vh'><LoopingLogo dark /></Box>)

  if (error || !data || !data.me || !data.me.id) {
    wipeToken()
    return (<Redirect to='/login'/>)
  }
  const {me, configuration} = data

  return (
    <PluralConfigurationContext.Provider value={configuration}>
    <CurrentUserContext.Provider value={me}>
      {children}
    </CurrentUserContext.Provider>
    </PluralConfigurationContext.Provider>
  )
}
