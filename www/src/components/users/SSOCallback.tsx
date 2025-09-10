import { Box } from 'grommet'
import { useEffect } from 'react'
import { useApolloClient, useMutation } from '@apollo/client'
import { useLocation, useNavigate } from 'react-router-dom'
import qs from 'query-string'

import { setToken } from '../../helpers/authentication'
import { GqlError } from '../utils/Alert'
import LoadingIndicator from '../utils/LoadingIndicator'

import { handleOauthChallenge } from './MagicLogin'
import { SSO_CALLBACK } from './queries'
import { getChallenge, getDeviceToken } from './utils'
import { finishedDeviceLogin } from './DeviceLoginNotif'
import { getLocalReturnUrl } from './utils'

export function SSOCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const client = useApolloClient()
  const { code } = qs.parse(location.search)
  const deviceToken = getDeviceToken()

  const [mutation, { error, loading }] = useMutation(SSO_CALLBACK, {
    variables: { code, deviceToken },
    onCompleted: (result) => {
      setToken(result.ssoCallback.jwt)
      if (deviceToken) finishedDeviceLogin()
      const challenge = getChallenge()

      if (challenge) {
        handleOauthChallenge(client, challenge)
      } else {
        navigate(getLocalReturnUrl())
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
