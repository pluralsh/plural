import { Div, Flex } from 'honorable'
import { DiscordIcon, GitHubLogoIcon, TwitterIcon } from 'pluralsh-design-system'

import { Breadcrumbs } from '../Breadcrumbs'

import SearchRepositories from '../repos/SearchRepositories'

export const TOOLBAR_HEIGHT = 57

function Toolbar() {
  return (
    <Flex
      align="center"
      height={57}
      px={2}
    >
      <Breadcrumbs />
      <Div flexGrow={1} />
      <SearchRepositories />
      <SocialIcon
        ml={2}
        icon={(
          <GitHubLogoIcon
            size={24}
            color="grey.200"
          />
        )}
        href="https://github.com/pluralsh/plural"
      />
      <SocialIcon
        icon={(
          <TwitterIcon
            size={24}
            color="grey.200"
          />
        )}
        href="https://twitter.com/plural_sh"
      />
      <SocialIcon
        icon={(
          <DiscordIcon
            size={24}
            color="grey.200"
          />
        )}
        href="https://discord.gg/qsUfBcC3Ru"
      />
    </Flex>
  )
}

function SocialIcon({ icon, href, ...props }) {
  return (
    <Flex
      p={0.5}
      align="center"
      justify="center"
      as="a"
      href={href}
      target="_blank"
      rel="noreferer noopener"
      borderRadius="50%"
      hoverIndicator="background-light"
      {...{ '&:hover *': { fill: 'white' } }}
      {...props}
    >
      {icon}
    </Flex>
  )
}

export default Toolbar
