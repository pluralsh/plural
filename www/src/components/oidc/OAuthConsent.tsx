import { useLocation, useNavigate } from 'react-router-dom'
import queryString, { ParsedQuery } from 'query-string'
import { ArrowRightLeftIcon, Button, IconFrame } from '@pluralsh/design-system'
import { useCallback } from 'react'
import { A, Flex, Span } from 'honorable'
import StartCase from 'lodash/startCase'
import { useTheme } from 'styled-components'

import { isEmpty } from 'lodash'

import { LoginPortal } from '../users/LoginPortal'
import { GqlError } from '../utils/Alert'
import { PLURAL_MARK, PLURAL_MARK_WHITE } from '../constants'
import {
  useConsentMutation,
  useMeQuery,
  useOidcConsentQuery,
} from '../../generated/graphql'
import { clearLocalStorage } from '../../helpers/localStorage'
import LoadingIndicator from '../utils/LoadingIndicator'

function Icon({
  icon,
  darkIcon,
}: {
  icon: Nullable<string>
  darkIcon: Nullable<string>
}) {
  const dark = useTheme().mode !== 'light'
  const src = dark ? darkIcon ?? icon : icon

  return src ? (
    <IconFrame
      icon={
        <img
          src={src}
          width="48px"
          height="48px"
        />
      }
      width="64px"
      height="64px"
      type="floating"
    />
  ) : null
}

const getChallenge = (parsedQueryString: ParsedQuery): string => {
  const challenge = parsedQueryString.consent_challenge

  if (Array.isArray(challenge)) {
    return !isEmpty(challenge) ? challenge[0] ?? '' : ''
  }

  return challenge ?? ''
}

export function OAuthConsent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: userData, loading: userLoading } = useMeQuery()
  const challenge = getChallenge(queryString.parse(location.search))
  const { data } = useOidcConsentQuery({ variables: { challenge } })
  const repository = data?.oidcConsent?.repository
  const consent = data?.oidcConsent?.consent
  const [mutation, { loading, error }] = useConsentMutation({
    variables: {
      challenge,
      scopes: consent?.requestedScope || ['profile', 'openid'],
    },
    onCompleted: ({ oauthConsent }) => {
      if (oauthConsent?.redirectTo) {
        window.location.href = oauthConsent.redirectTo
      }
    },
  })

  const logout = useCallback(() => {
    clearLocalStorage()
    navigate('/login')
  }, [navigate])

  if (!data || userLoading) return <LoadingIndicator />

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
          {repository && (
            <>
              <ArrowRightLeftIcon size={18} />
              <Icon
                icon={repository.icon}
                darkIcon={repository.darkIcon}
              />
            </>
          )}
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
          >
            {repository?.name
              ? `${StartCase(repository.name)} requires access`
              : 'Access required'}
          </Span>
          <Span
            body1
            color="text-light"
            textAlign="center"
          >
            Click "Allow" below to allow access to your profile.
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
          >
            You are currently signed in as {userData?.me?.email}.&nbsp;
            <A
              inline
              onClick={logout}
            >
              Wrong account?
            </A>
          </Span>
        </Flex>
      </Flex>
    </LoginPortal>
  )
}
