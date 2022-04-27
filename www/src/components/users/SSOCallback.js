import { Box } from 'grommet'
import { useEffect } from 'react'
import { useApolloClient, useMutation } from '@apollo/client'
import { useLocation } from 'react-router-dom'

import qs from 'query-string'

import { setToken } from '../../helpers/authentication'
import { GqlError } from '../utils/Alert'
import { LoopingLogo } from '../utils/AnimatedLogo'

import { handleOauthChallenge } from './MagicLogin'
import { SSO_CALLBACK } from './queries'
import { getChallenge, getDeviceToken } from './utils'
import { finishedDeviceLogin } from './DeviceLoginNotif'

export function SSOCallback() {
  const location = useLocation()
  const client = useApolloClient()
  const { code } = qs.parse(location.search)
  const deviceToken = getDeviceToken()

  const [mutation, { error, loading }] = useMutation(SSO_CALLBACK, {
    variables: { code, deviceToken },
    onCompleted: result => {
      setToken(result.ssoCallback.jwt)
      if (deviceToken) finishedDeviceLogin()
      const challenge = getChallenge()
      if (challenge) {
        handleOauthChallenge(client, challenge)
      }
      else {
        window.location.href = '/'
      }
    },
  })

  useEffect(() => {
    mutation()
  }, [mutation])

  return (
    <Box
      height="100vh"
      width="100vw"
      align="center"
      justify="center"
    >
      {loading && <LoopingLogo />}
      {error && (
        <GqlError
          error={error}
          header="Failed to log in"
        />
      )}
    </Box>
  )
}
