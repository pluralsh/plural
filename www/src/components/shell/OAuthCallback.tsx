import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'

import { LoopingLogo } from '../utils/AnimatedLogo'
import { useHistory } from '../../router'
import { AuthorizationUrl } from '../../generated/graphql'

import { AUTHENTICATION_URLS_QUERY, SCM_TOKEN_QUERY } from './queries'
import { useDevToken } from './hooks/useDevToken'
import { useContextStorage } from './onboarding/context/hooks'
import { ContextProps } from './onboarding/context/onboarding'

function OAuthCallback({ provider }: any) {
  const history = useHistory()
  const [searchParams] = useSearchParams()
  const devToken = useDevToken()
  const navigate = useNavigate()
  const { save, restore } = useContextStorage()
  const serializableContext = restore()

  const { data: authUrlData } = useQuery(AUTHENTICATION_URLS_QUERY)

  let { data } = useQuery(SCM_TOKEN_QUERY, {
    variables: {
      code: searchParams.get('code'),
      provider: provider.toUpperCase(),
    },
  })

  // HACK to navigate the onboarding on staging environments
  if (import.meta.env.MODE !== 'production' && devToken) {
    data = { ...data, ...{ scmToken: devToken } }
  }

  if (!data || !authUrlData) {
    return (
      <LoopingLogo />
    )
  }

  if (!data.scmToken) {
    history.navigate('/shell')

    return null
  }

  save({
    ...serializableContext,
    scm: {
      ...serializableContext.scm, provider: provider.toUpperCase(), authUrls: authUrlData?.scmAuthorization as Array<AuthorizationUrl>, token: data.scmToken,
    },
  } as ContextProps)
  navigate('/shell')

  return null
}

export default OAuthCallback
