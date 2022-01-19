import React, { useCallback } from 'react'
import { Box, Text } from 'grommet'
import { Github } from 'grommet-icons'
import { useLocation } from 'react-router'
import { useQuery } from 'react-apollo'
import { AUTH_URLS, SCM_TOKEN } from './query'
import { LoopingLogo } from '../utils/AnimatedLogo'

function CreateShell({code}) {
  const {data} = useQuery(SCM_TOKEN, {variables: {code, provider: 'GITHUB'}})

  if (!data) return <LoopingLogo />

  return (
    <Box fill align='center' justify='center'>
      {data.scmToken}
    </Box>
  )
}

export function CloudShell() {
  const loc = useLocation()
  const params = new URLSearchParams(loc.search)
  const {data} = useQuery(AUTH_URLS)
  const onClick = useCallback(() => {
    if (!data) return
    const [{url}] = data.scmAuthorization 
    window.location = url
  }, [data])

  if (params.get('code')) return <CreateShell code={params.get('code')} />

  return (
    <Box fill align='center' justify='center'>
      <Box flex={false} pad='small' round='xsmall' direction='row' gap='small' border
           align='center' hoverIndicator='tone-light' onClick={onClick}>
        <Github size='15px' />
        <Text size='small' weight={500}>Log In With Github To Start</Text>
      </Box>
    </Box>
  )
}