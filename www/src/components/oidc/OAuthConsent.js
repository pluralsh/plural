import React from 'react'
import { useLocation } from 'react-router'
import { Loading, Button } from 'forge-core'
import queryString from 'query-string'
import { useMutation, useQuery } from 'react-apollo'
import { GET_CONSENT, OAUTH_CONSENT } from './queries'
import { LoginPortal } from '../users/MagicLogin'
import { Transaction } from 'grommet-icons'
import { GqlError } from '../utils/Alert'
import { Box, Text } from 'grommet'
import { PLURAL_MARK } from '../constants'
import { RepoIcon } from '../repos/Repositories'

export function OAuthConsent() {
  const location = useLocation()
  const {consent_challenge: challenge} = queryString.parse(location.search)
  const [mutation, {loading, error}] = useMutation(OAUTH_CONSENT, {
    variables: {challenge, scopes: ['profile']},
    onCompleted: ({oauthConsent: {redirectTo}}) => {
      window.location = redirectTo
    }
  })
  const {data} = useQuery(GET_CONSENT, {variables: {challenge}})

  if (!data) return <Box fill><Loading /></Box>

  const {oauthConsent} = data

  return (
    <LoginPortal>
      <Box width='350px' gap='small' align='center'>
        <Box direction='row' align='center' justify='center' gap='small' fill='horizontal'>
          <img src={PLURAL_MARK} width='60px' />
          <Transaction size='15px' />
          <RepoIcon repo={oauthConsent} size='60px' />
        </Box>
        <Text size='medium'>{oauthConsent.name} would like access to your profile</Text>
        <Box width='300px' pad={{vertical: 'small'}}>
          {error && <GqlError error={error} header="Consent request failed" />}
          <Button loading={loading} onClick={mutation} label='Allow' />
        </Box>
      </Box>
    </LoginPortal>
  )
}