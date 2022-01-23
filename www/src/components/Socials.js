import React from 'react'
import { Box } from 'grommet'
import { Github, Twitter } from 'grommet-icons'
import { Discord } from 'forge-core'

const ICON_SIZE = '17px'
const BOX_SIZE  = '28px'

function SocialLink({icon, url}) {
  return (
    <a href={url} target='_blank'>
    <Box width={BOX_SIZE} height={BOX_SIZE} align='center' justify='center'
         onClick={() => null} hoverIndicator='backgroundColor' round='xsmall'>
      {icon}
    </Box>
    </a>
  )
}

export function SocialLinks() {
  return (
    <Box flex={false} background='sidebarHover' direction='row' gap='xsmall' 
         border round='xsmall' pad={{horizontal: 'xsmall'}} height='32px' align='center'>
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