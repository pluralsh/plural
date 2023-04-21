import { useEffect } from 'react'
import { useApolloClient, useMutation } from '@apollo/client'
import { useLocation, useParams } from 'react-router-dom'
import qs from 'query-string'
import { Box } from 'grommet'

import { setToken } from '../../helpers/authentication'
import { host } from '../../helpers/hostname'
import { GqlError } from '../utils/Alert'
import LoadingIndicator from '../utils/LoadingIndicator'

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
    variables: {
      code, host: host(), provider: service?.toUpperCase(), deviceToken,
    },
    onCompleted: ({ oauthCallback }) => {
      setToken(oauthCallback.jwt)
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

  if (loading) return <LoadingIndicator />

  return error ? (
    <Box
      height="100vh"
      width="100vw"
      align="center"
      justify="center"
    >
      <GqlError
        error={error}
        header="Failed to log in"
      />
    </Box>
  ) : null
}
