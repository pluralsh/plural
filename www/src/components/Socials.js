import { A, Div } from 'honorable'
import { DiscordIcon, GitHubLogoIcon, TwitterIcon } from 'pluralsh-design-system'

const ICON_SIZE = 22
const BOX_SIZE = 28

function SocialLink({ icon, url }) {
  return (
    <A
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      ml={0.25}
      xflex="x5"
      width={BOX_SIZE}
      height={BOX_SIZE}
      hoverIndicator="background-light"
      borderRadius={4}
    >
      {icon}
    </A>
  )
}

export function SocialLinks() {
  return (
    <Div
      ml={1}
      xflex="x4"
      flexShrink={0}
    >
      <SocialLink
        icon={(
          <GitHubLogoIcon
            size={ICON_SIZE}
            color="white"
          />
        )}
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
        icon={(
          <TwitterIcon
            size={ICON_SIZE}
            color="white"
          />
        )}
        url="https://twitter.com/plural_sh"
      />
    </Div>
  )
}
