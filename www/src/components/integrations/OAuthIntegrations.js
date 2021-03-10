import React from 'react'
import { useQuery } from 'react-apollo'
import { Box, Text } from 'grommet'
import { ZOOM_ICON, ZOOM_INSTALL_URL } from './constants'
import { OAUTH_Q } from './queries'
import { OAuthService } from './types'

function redirectUrl(format, service) {
  const location = `${window.location.origin}/oauth/accept/${service.toLowerCase()}`
  return format.replace('{redirect_uri}', encodeURIComponent(location))
}

function Integration({icon, installUrl, integrations, service, children}) {
  console.log(window.location)
  const onClick = integrations[service] ? null : () => window.location = redirectUrl(installUrl, service)
  return (
    <Box flex={false} pad='small' border={{color: 'light-5'}} hoverIndicator='light-2' onClick={onClick}
         direction='row' align='center' round='xsmall' gap='small'>
      <Box flex={false}>
        <img src={icon} alt='' height='50px' width='50px' />
      </Box>
      <Box fill='horizontal'>
        {children}
      </Box>
    </Box>
  )
}

export function OAuthIntegrations() {
  const {data} = useQuery(OAUTH_Q, {fetchPolicy: 'cache-and-network'})

  if (!data) return null

  const integrations = data.oauthIntegrations.reduce((acc, int) => ({...acc, [int.service]: int}), {})

  return (
    <Box pad='small' gap='xsmall'>
      <Box fill='horizontal' align='center' pad='medium'>
        <Text size='small' weight={500}>OAuth Integrations</Text>
      </Box>
      <Integration 
        icon={ZOOM_ICON}  installUrl={ZOOM_INSTALL_URL}  integrations={integrations} service={OAuthService.ZOOM}>
        <Box fill='horizontal'>
          <Text size='small' weight={500}>Zoom.us</Text>
        </Box>
        <Box>
          <Text size='small'><i>Create meetings in your zoom account for resolving incidents and more</i></Text>
        </Box>
      </Integration>
    </Box>
  )
}