import React from 'react'
import {useQuery} from 'react-apollo'
import {Redirect} from 'react-router-dom'
import {Box} from 'grommet'
import { Loading } from 'forge-core'
import {ME_Q} from '../users/queries'
import {wipeToken} from '../../helpers/authentication'
import { useNotificationSubscription } from '../incidents/Notifications'

// const POLL_INTERVAL=30000
export const CurrentUserContext = React.createContext({})

export default function CurrentUser({children}) {
  const {loading, error, data} = useQuery(ME_Q)
  useNotificationSubscription()

  if (loading) return (<Box height='100vh'><Loading/></Box>)

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
