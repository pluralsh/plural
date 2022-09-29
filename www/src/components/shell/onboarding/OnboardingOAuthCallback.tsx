import { useEffect } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { LoopingLogo } from 'pluralsh-design-system'
import { Flex } from 'honorable'

import { AUTHENTICATION_URLS_QUERY, SCM_TOKEN_QUERY } from '../queries'
import { persistGitData } from '../persistance'

import DEBUG_SCM_TOKENS from './debug-tokens'

function OnboardingOAuthCallback() {
  const { provider = '' } = useParams()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')

  const { data: authUrlData } = useQuery(AUTHENTICATION_URLS_QUERY)

  let { data } = useQuery(SCM_TOKEN_QUERY, {
    variables: {
      code,
      provider: provider.toUpperCase(),
    },
  })

  // Do not remove this line, it is needed for dev
  // Used to retrieve the token from production
  console.log(data)

  // Dev only
  if (process.env.NODE_ENV !== 'production' && DEBUG_SCM_TOKENS[provider.toUpperCase()]) {
    data = { ...data, ...{ scmToken: DEBUG_SCM_TOKENS[provider.toUpperCase()] } }
  }

  useEffect(() => {
    persistGitData({
      authUrlData,
      accessToken: data.scmToken,
    })
  }, [authUrlData, data])

  if (authUrlData && data?.scmToken) {
    return (
      <Navigate to="/shell/onboarding/repository" />
    )
  }

  if (data && !data?.scmToken) {
    return (
      <Navigate to="/shell" />
    )
  }

  return (
    <Flex
      align="center"
      justify="center"
      flexGrow={1}
    >
      <LoopingLogo />
    </Flex>
  )
}

export default OnboardingOAuthCallback
