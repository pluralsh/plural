import {
  Button,
  Flex,
} from 'honorable'
import {
  DiscordIcon,
  LifePreserverIcon,
  ScrollIcon,
} from 'pluralsh-design-system'

function OnboardingSidecar() {
  return (
    <Flex
      border="1px solid border"
      borderRadius="large"
      padding="medium"
      direction="column"
      marginTop={57}
      marginRight="xlarge"
    >
      <Button
        small
        tertiary
        as="a"
        target="_blank"
        href="https://docs.plural.sh"
        startIcon={(
          <LifePreserverIcon />
        )}
        justifyContent="flex-start"
      >
        Support
      </Button>
      <Button
        small
        tertiary
        as="a"
        target="_blank"
        href="https://docs.plural.sh"
        startIcon={(
          <ScrollIcon />
        )}
        justifyContent="flex-start"
      >
        Docs
      </Button>
      <Button
        small
        tertiary
        as="a"
        target="_blank"
        href="https://discord.gg/pluralsh"
        startIcon={(
          <DiscordIcon />
        )}
        justifyContent="flex-start"
      >
        Discord
      </Button>
    </Flex>
  )
}

export default OnboardingSidecar
