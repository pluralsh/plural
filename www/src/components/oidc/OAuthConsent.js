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
import { RepositoryIcon } from '../repos/Repository'

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

  if (!data) return <Loading />

  const {oauthConsent} = data

  return (
    <LoginPortal>
      <Box gap='small'>
        <Box direction='row' align='center' gap='small'>
          <img src={PLURAL_MARK} width='60px' />
          <Transaction size='15px' />
          <RepositoryIcon repository={oauthConsent} size='60px' />
        </Box>
        <Text size='small'>{oauthConsent.name} would like access to your profile</Text>
        <Box width='300px' pad={{vertical: 'small'}}>
          {error && <GqlError error={error} header="Consent request failed" />}
          <Button loading={loading} onClick={mutation} label='Allow' />
        </Box>
      </Box>
    </LoginPortal>
  )
}