import { Box } from 'grommet'
import { useEffect } from 'react'
import { useApolloClient, useMutation } from '@apollo/client'
import { useLocation, useParams } from 'react-router-dom'
import qs from 'query-string'

import { setToken } from '../../helpers/authentication'
import { host } from '../../helpers/hostname'
import { GqlError } from '../utils/Alert'
import { LoopingLogo } from '../utils/AnimatedLogo'

import { handleOauthChallenge } from './MagicLogin'
import { OAUTH_CALLBACK } from './queries'
import { getChallenge, getDeviceToken } from './utils'
import { finishedDeviceLogin } from './DeviceLoginNotif'

export function OAuthCallback() {
  const location = useLocation()
  const client = useApolloClient()
  const { service } = useParams()
  const { code } = qs.parse(location.search)
  const deviceToken = getDeviceToken()

  const [mutation, { error, loading }] = useMutation(OAUTH_CALLBACK, {
    variables: { code, host: host(), provider: service.toUpperCase(), deviceToken },
    onCompleted: result => {
      setToken(result.oauthCallback.jwt)
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
