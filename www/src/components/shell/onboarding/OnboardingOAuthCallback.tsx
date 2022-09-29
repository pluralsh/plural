import { Navigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { LoopingLogo } from 'pluralsh-design-system'

import { AUTHENTICATION_URLS_QUERY, SCM_TOKEN_QUERY } from '../queries'

import DEBUG_SCM_TOKENS from './debug-tokens'

function OAuthCallback({ provider }) {
  const [searchParams] = useSearchParams()

  const { data: authUrlData } = useQuery(AUTHENTICATION_URLS_QUERY)

  let { data, loading } = useQuery(SCM_TOKEN_QUERY, {
    variables: {
      code: searchParams.get('code'),
      provider: provider.toUpperCase(),
    },
  })

  console.log(data)

  // Dev only
  if (process.env.NODE_ENV !== 'production' && DEBUG_SCM_TOKENS[provider.toUpperCase()]) {
    data = { ...data, ...{ scmToken: DEBUG_SCM_TOKENS[provider.toUpperCase()] } }
  }

  if (!data) {
    return (
      <LoopingLogo />
    )
  }

  if (!data.scmToken) {
    return (
      <Navigate to="/shell" />
    )
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
