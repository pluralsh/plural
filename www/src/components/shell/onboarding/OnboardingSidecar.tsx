import {
  Button,
  Div,
  Flex,
} from 'honorable'
import {
  DiscordIcon,
  LifePreserverIcon,
  ScrollIcon,
} from 'pluralsh-design-system'

import OnboardingSidecarApplications from './OnboardingSidecarApplications'

function OnboardingSidecar({ displayApplications = false }) {
  return (
    <Div width={200}>
      <Flex
        border="1px solid border"
        borderRadius="large"
        padding="medium"
        direction="column"
        marginBottom="large"
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
      {displayApplications && <OnboardingSidecarApplications />}
    </Div>
  )
}

export default OnboardingSidecar
