import { useLocation } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { Button } from 'forge-core'
import queryString from 'query-string'
import { ArrowRightLeftIcon } from 'pluralsh-design-system'
import { Box, Text } from 'grommet'

import { LoginPortal } from '../users/MagicLogin'
import { GqlError } from '../utils/Alert'
import { PLURAL_MARK_WHITE } from '../constants'
import { RepoIcon } from '../repos/Repositories'
import { LoopingLogo } from '../utils/AnimatedLogo'

import { GET_OIDC_CONSENT, OAUTH_CONSENT } from './queries'

export function OAuthConsent() {
  const location = useLocation()
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

  if (!data) {
    return (
      <Box
        height="100vh"
        width="100%"
      ><LoopingLogo />
      </Box>
    )
  }

  return (
    <LoginPortal>
      <Box
        width="350px"
        gap="small"
        align="center"
      >
        <Box
          direction="row"
          align="center"
          justify="center"
          gap="small"
          fill="horizontal"
        >
          <img
            src={PLURAL_MARK_WHITE}
            width="60px"
          />
          <ArrowRightLeftIcon size={15} />
          <RepoIcon
            repo={repository}
            size="60px"
          />
        </Box>
        <Text size="medium">{repository.name} would like access to your profile</Text>
        <Box
          width="300px"
          pad={{ vertical: 'small' }}
          gap="small"
        >
          {error && (
            <GqlError
              error={error}
              header="Consent request failed"
            />
          )}
          <Button
            loading={loading}
            onClick={() => mutation()}
            label="Allow"
          />
        </Box>
      </Box>
    </LoginPortal>
  )
}
