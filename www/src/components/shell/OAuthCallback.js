import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { AUTH_URLS, SCM_TOKEN } from './query'
import { DEBUG_SCM_TOKENS } from './constants'

import CreateShell from './CreateShell'

function OAuthCallback({ provider }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { data: authUrlData } = useQuery(AUTH_URLS)

  let { data } = useQuery(SCM_TOKEN, {
    variables: {
      code: searchParams.get('code'),
      provider: provider.toUpperCase(),
    },
  })

  // START <<Remove this after dev>>
  if (process.env.NODE_ENV !== 'production' && DEBUG_SCM_TOKENS[provider.toUpperCase()]) {
    data = { ...data, ...{ scmToken: DEBUG_SCM_TOKENS[provider.toUpperCase()] } }
  }
  // END <<Remove this after dev>>

  if (!data) {
    return (
      <LoopingLogo />
    )
  }

  if (!data.scmToken) {
    navigate('/shell')

    return null
  }

  return (
    <CreateShell
      accessToken={data.scmToken}
      provider={provider.toUpperCase()}
      onCreate={() => navigate('/shell')}
      authUrlData={authUrlData}
    />
  )
}

export default OAuthCallback
