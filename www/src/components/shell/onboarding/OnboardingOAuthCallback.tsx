import { useEffect } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { LoopingLogo } from 'pluralsh-design-system'
import { Flex } from 'honorable'

import { AUTHENTICATION_URLS_QUERY, SCM_TOKEN_QUERY } from '../queries'

import { SECTION_GIT } from '../constants'

import { usePersistedGitData } from '../usePersistance'

import DEBUG_SCM_TOKENS from './debug-tokens'
import useOnboardingNavigation from './useOnboardingNavigation'

function OnboardingOAuthCallback() {
  const { provider = '' } = useParams()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const { nextTo } = useOnboardingNavigation(SECTION_GIT)
  const [, setGitData] = usePersistedGitData()

  const { data: authUrlData } = useQuery(AUTHENTICATION_URLS_QUERY)

  let { data } = useQuery(SCM_TOKEN_QUERY, {
    variables: {
      code,
      provider: provider.toUpperCase(),
    },
  })

  // Do not remove this line, it is needed for local onboarding development
  // Used to retrieve the token from production
  console.log(data)

  // Dev only
  if (process.env.NODE_ENV !== 'production' && DEBUG_SCM_TOKENS[provider.toUpperCase()]) {
    data = { ...data, ...{ scmToken: DEBUG_SCM_TOKENS[provider.toUpperCase()] } }
  }

  useEffect(() => {
    setGitData(x => ({
      ...x,
      authUrlData,
      accessToken: data.scmToken,
    }))
  }, [authUrlData, data, setGitData])

  if (authUrlData && data?.scmToken && nextTo) {
    return (
      <Navigate to={nextTo} />
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
