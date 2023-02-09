import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import queryString from 'query-string'
import {
  ArrowRightLeftIcon,
  Button,
  IconFrame,
  LoopingLogo,
} from '@pluralsh/design-system'
import { ThemeContext } from 'grommet'
import { useCallback, useContext, useEffect } from 'react'
import { A, Flex, Span } from 'honorable'
import StartCase from 'lodash/startCase'

import { LoginPortal } from '../users/LoginPortal'
import { GqlError } from '../utils/Alert'
import { PLURAL_MARK, PLURAL_MARK_WHITE } from '../constants'
import { useMeQuery } from '../../generated/graphql'
import { clearLocalStorage } from '../../helpers/localStorage'

import { PosthogEvent, posthogCapture } from '../../utils/posthog'

import { GET_OIDC_CONSENT, OAUTH_CONSENT } from './queries'

function Icon({ icon, darkIcon }: any) {
  const { dark } = useContext(ThemeContext) as any

  return (
    <IconFrame
      icon={(
        <img
          src={dark ? darkIcon || icon : icon}
          width="48px"
          height="48px"
        />
      )}
      width="64px"
      height="64px"
      type="floating"
    />
  )
}

export function OAuthConsent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: userData, loading: userLoading } = useMeQuery()
  const { consent_challenge: challenge } = queryString.parse(location.search)
  const { data } = useQuery(GET_OIDC_CONSENT, { variables: { challenge } })
  const repository = data?.oidcConsent?.repository
  const consent = data?.oidcConsent?.consent
  const [mutation, { loading, error }] = useMutation(OAUTH_CONSENT, {
    variables: { challenge, scopes: consent?.requestedScope || ['profile', 'openid'] },
    onCompleted: ({ oauthConsent: { redirectTo } }) => {
      window.location = redirectTo
    },
  })

  const logout = useCallback(() => {
    clearLocalStorage()
    navigate('/login')
  }, [navigate])

  useEffect(() => {
    if (repository && userData) {
      posthogCapture(PosthogEvent.OIDCLogin, {
        applicationID: repository.id,
        applicationName: repository.name,
        installationID: repository.installation?.id,
      })
    }
  }, [repository])

  if (!data || userLoading) {
    return (
      <Flex
        grow={1}
        align="center"
        justify="center"
      ><LoopingLogo />
      </Flex>
    )
  }

  if (!userData?.me?.email) {
    logout()
  }

  return (
    <LoginPortal>
      <Flex
        direction="column"
        align="center"
        gap="xlarge"
      >
        <Flex
          direction="row"
          gap="large"
        >
          <Icon
            icon={PLURAL_MARK}
            darkIcon={PLURAL_MARK_WHITE}
          />
          <ArrowRightLeftIcon size={18} />
          <Icon
            icon={repository.icon}
            darkIcon={repository.darkIcon}
          />
        </Flex>

        <Flex
          direction="column"
          align="center"
          gap="xsmall"
          paddingTop="medium"
        >
          <Span
            title1
            size="medium"
            textAlign="center"
          >{StartCase(repository.name)} requires access
          </Span>
          <Span
            body1
            color="text-light"
            textAlign="center"
          >Click "Allow" below to allow access to your profile.
          </Span>

        </Flex>
        <Flex
          gap="small"
          width="100%"
          direction="column"
          align="center"
        >
          {error && (
            <GqlError
              error={error}
              header="Consent request failed"
            />
          )}
          <Button
            width="100%"
            loading={loading}
            onClick={() => mutation()}
          >
            Allow
          </Button>

          <Span
            caption
            color="text-xlight"
            textAlign="center"
          >You are currently signed in as {userData?.me?.email}.&nbsp;
            <A
              inline
              onClick={logout}
            >Wrong account?
            </A>
          </Span>
        </Flex>
      </Flex>
    </LoginPortal>
  )
}
