import React, { useCallback, useEffect } from 'react'
import { Box, Text } from 'grommet'
import { Github } from 'grommet-icons'
import { githubAuth } from './oauth'
import { useLocation } from 'react-router'

export function CloudShell() {
  const loc = useLocation()
  const params = new URLSearchParams(loc.search)
  const onClick = useCallback(() => {
    window.location = githubAuth.token.getUri()
  }, [])

  useEffect(() => {
    if (params.get('code')) {
      const fetchData = async () => {
        console.log('fetching')
        const uri = window.location.href
        githubAuth.token.getToken(uri).then(console.log).catch(console.log)
      }
      fetchData()
    }
  }, [params])

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