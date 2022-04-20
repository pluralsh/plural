import { Box } from 'grommet'
import { DiscordIcon, GitHubLogoIcon, TwitterIcon } from 'pluralsh-design-system'

const ICON_SIZE = '22px'
const BOX_SIZE = '28px'

function SocialLink({ icon, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ marginLeft: '0.25rem' }}
    >
      <Box
        width={BOX_SIZE}
        height={BOX_SIZE}
        align="center"
        justify="center"
        onClick={() => null}
        hoverIndicator="backgroundColor"
        round="xsmall"
      >
        {icon}
      </Box>
    </a>
  )
}

export function SocialLinks() {
  return (
    <Box
      flex={false}
      margin={{ left: '16px' }}
      direction="row"
      align="center"
    >
      <SocialLink
        icon={<GitHubLogoIcon size={ICON_SIZE} />}
        url="https://github.com/pluralsh/plural"
      />
      <SocialLink
        icon={(
          <DiscordIcon
            size={ICON_SIZE}
            color="white"
          />
        )}
        url="https://discord.gg/bEBAMXV64s"
      />
      <SocialLink
        icon={<TwitterIcon size={ICON_SIZE} />}
        url="https://twitter.com/plural_sh"
      />
    </Box>
  )
}
