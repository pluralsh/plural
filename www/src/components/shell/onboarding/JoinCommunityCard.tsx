import { Div, Flex, P } from 'honorable'
import { Button, DiscordIcon } from '@pluralsh/design-system'

import OnboardingCard from './OnboardingCard'

export function JoinCommunityCard() {
  return (
    <OnboardingCard
      marginTop="xlarge"
      paddingBottom="medium"
    >
      <Flex
        align="center"
        justify="space-between"
      >
        <Div>
          <P
            body1
            bold
          >
            Join the community
          </P>
          <P
            body1
            color="text-light"
          >
            Receive support from our team.
          </P>
        </Div>
        <Button
          secondary
          endIcon={<DiscordIcon />}
          as="a"
          href="https://discord.gg/pluralsh"
          target="_blank"
          rel="noopener noreferrer"
        >
          Join Discord
        </Button>
      </Flex>
    </OnboardingCard>
  )
}
