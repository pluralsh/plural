import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'

import { useEffect, useMemo } from 'react'

import { LoopingLogo } from '../utils/AnimatedLogo'
import { AuthorizationUrl, RootQueryType, ScmProvider } from '../../generated/graphql'

import { AUTHENTICATION_URLS_QUERY, SCM_TOKEN_QUERY } from './queries'
import { useDevToken } from './hooks/useDevToken'
import { useContextStorage } from './onboarding/context/hooks'
import { ContextProps, SerializableContextProps } from './onboarding/context/onboarding'

const toOnboardingContext = (
  sContext: SerializableContextProps, provider: ScmProvider, authUrlData: Pick<RootQueryType, 'scmAuthorization'>, token: string
): ContextProps => ({
  ...sContext,
  scm: {
    ...sContext.scm,
    provider: provider.toUpperCase(),
    authUrls: authUrlData?.scmAuthorization as Array<AuthorizationUrl>,
    token,
  },
} as ContextProps)

function OAuthCallback({ provider }: any) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const devToken = useDevToken()
  const { save, restore } = useContextStorage()
  const serializableContext = restore()

  const { data: authUrlData } = useQuery(AUTHENTICATION_URLS_QUERY)
  const { data } = useQuery(SCM_TOKEN_QUERY, {
    variables: {
      code: searchParams.get('code'),
      provider: provider.toUpperCase(),
    },
  })

  // Use dev token for the onboarding on non-production environments
  const token = useMemo(() => (import.meta.env.MODE !== 'production' && devToken ? devToken : data?.scmToken), [data?.scmToken, devToken])
  const updatedContext = useMemo(() => toOnboardingContext(
    serializableContext, provider, authUrlData, token
  ), [authUrlData, provider, serializableContext, token])

  useEffect(() => {
    if (!data) return
    if (!token) navigate('shell')

    save(updatedContext)
    navigate('/shell')
  }, [data, navigate, save, token, updatedContext])

  return (
    <LoopingLogo />
  )
}

export default OAuthCallback
