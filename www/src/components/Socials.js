import React from 'react'
import { Box } from 'grommet'
import { Github, Twitter } from 'grommet-icons'
import { Discord } from 'forge-core'

const ICON_SIZE = '15px'
const BOX_SIZE  = '25px'

function SocialLink({icon, url}) {
  return (
    <a href={url} target='_blank'>
    <Box width={BOX_SIZE} height={BOX_SIZE} align='center' justify='center'
         onClick={() => null} hoverIndicator='sidebarHover' round='xsmall'>
      {icon}
    </Box>
    </a>
  )
}

export function SocialLinks() {
  return (
    <Box flex={false} direction='row' gap='xsmall' border round='xsmall' pad='xsmall'>
      <SocialLink 
        icon={<Github size={ICON_SIZE} />}
        url='https://github.com/pluralsh/plural' />
      <SocialLink
        icon={<Discord size={ICON_SIZE} color='white' />}
        url='https://discord.gg/bEBAMXV64s' />
      <SocialLink
        icon={<Twitter size={ICON_SIZE} />}
        url='https://twitter.com/plural_sh' />
    </Box>
  )
}