import React from 'react'
import { Github, Google } from 'grommet-icons'
import { Box, Text } from 'grommet'
import { Check } from 'forge-core'

export const METHOD_ICONS = {
  GOOGLE: Google,
  GITHUB: Github,
}

export function OauthEnabler({ url: { provider, authorizeUrl }, me }) {
  const icon = METHOD_ICONS[provider]

  return (
    <Box
      direction="row"
      gap="small"
      align="center"
      hoverIndicator="tone-light"
      onClick={() => {
        window.location = authorizeUrl 
      }}
      pad="small"
    >
      <Box flex={false}>
        {React.createElement(icon, { size: 'medium', color: 'plain' })}
      </Box>
      <Box
        direction="row"
        fill="horizontal"
      >
        <Text size="small">Enable log in with {provider.toLowerCase()}</Text>
      </Box>
      {me.loginMethod === provider && (
        <Box flex={false}>
          <Check
            color="brand"
            size="medium"
          />
        </Box>
      )}
    </Box>
  )
}
