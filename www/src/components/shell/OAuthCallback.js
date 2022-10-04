import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { useHistory } from '../../router'

import { AUTHENTICATION_URLS_QUERY, SCM_TOKEN_QUERY } from './queries'
import { DEBUG_SCM_TOKENS } from './debug-tokens'

import OnboardingFlow from './onboarding/OnboardingFlow'

function OAuthCallback({ provider }) {
  const history = useHistory()
  const [searchParams] = useSearchParams()

  const { data: authUrlData } = useQuery(AUTHENTICATION_URLS_QUERY)

  let { data } = useQuery(SCM_TOKEN_QUERY, {
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
    history.navigate('/shell')

    return null
  }

  return (
    <OnboardingFlow
      accessToken={data.scmToken}
      provider={provider.toUpperCase()}
      authUrlData={authUrlData}
    />
  )
}

export default OAuthCallback
