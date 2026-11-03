import { useLocation, useNavigate } from 'react-router-dom'
import queryString, { ParsedQuery } from 'query-string'
import {
  ArrowRightLeftIcon,
  Button,
  Flex,
  IconFrame,
} from '@pluralsh/design-system'
import { useCallback } from 'react'
import StartCase from 'lodash/startCase'
import styled, { useTheme } from 'styled-components'

import { isEmpty } from 'lodash'

import { LoginPortal } from '../users/LoginPortal'
import { GqlError } from '../utils/Alert'
import { PLURAL_LOGOMARK_WHITE } from '../constants'
import {
  useConsentMutation,
  useMeQuery,
  useOidcConsentQuery,
} from '../../generated/graphql'
import { clearLocalStorage } from '../../helpers/localStorage'
import LoadingIndicator from '../utils/LoadingIndicator'
import {
  Body1P,
  CaptionP,
  InlineLinkButtonSC,
  Title1H1,
} from '../utils/Typography'

function Icon({
  icon,
  darkIcon,
}: {
  icon: Nullable<string>
  darkIcon: Nullable<string>
}) {
  const dark = useTheme().mode !== 'light'
  const src = dark ? (darkIcon ?? icon) : icon

  return src ? (
    <IconFrame
      icon={
        <img
          src={src}
          width="48px"
          height="48px"
        />
      }
      style={{ width: 64, height: 64 }}
      type="floating"
    />
  ) : null
}

// Plural apps that sign in through Plural share its mark on their own color
const APP_TILE_COLORS: Record<string, string> = {
  plural: '#4A51F2',
  console: '#66C7FF',
}

function AppTile({ name }: { name: string }) {
  return (
    <AppTileSC
      role="img"
      aria-label={StartCase(name)}
      $color={APP_TILE_COLORS[name]}
    >
      <img
        src={PLURAL_LOGOMARK_WHITE}
        alt=""
        width={30}
        height={31}
      />
    </AppTileSC>
  )
}

const AppTileSC = styled.div<{ $color: string }>(({ theme, $color }) => ({
  width: 64,
  height: 64,
  borderRadius: theme.borderRadiuses.large,
  background: $color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const getChallenge = (parsedQueryString: ParsedQuery): string => {
  const challenge = parsedQueryString.consent_challenge

  if (Array.isArray(challenge)) {
    return !isEmpty(challenge) ? (challenge[0] ?? '') : ''
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
          align="center"
          gap="large"
        >
          <AppTile name="plural" />
          {repository && (
            <>
              <ArrowRightLeftIcon
                size={18}
                color="icon-light"
              />
              {APP_TILE_COLORS[repository.name] ? (
                <AppTile name={repository.name} />
              ) : (
                <Icon
                  icon={repository.icon}
                  darkIcon={repository.darkIcon}
                />
              )}
            </>
          )}
        </Flex>

        <Flex
          direction="column"
          align="center"
          gap="xsmall"
          paddingTop="medium"
        >
          <Title1H1
            as="span"
            css={{ textAlign: 'center' }}
          >
            {repository?.name
              ? `${StartCase(repository.name)} requires access`
              : 'Access required'}
          </Title1H1>
          <Body1P
            as="span"
            $color="text-light"
            css={{ textAlign: 'center' }}
          >
            {repository?.name
              ? `Allow ${StartCase(repository.name)} to access your Plural profile.`
              : 'Click "Allow" below to allow access to your profile.'}
          </Body1P>
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

          <CaptionP
            as="span"
            $color="text-xlight"
            css={{ textAlign: 'center' }}
          >
            You are currently signed in as {userData?.me?.email}.&nbsp;
            <InlineLinkButtonSC onClick={logout}>
              Wrong account?
            </InlineLinkButtonSC>
          </CaptionP>
        </Flex>
      </Flex>
    </LoginPortal>
  )
}
