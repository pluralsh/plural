import { Div, Flex, P } from 'honorable'
import {
  Button, Chip, DiscordIcon, ProgressBar,
} from 'pluralsh-design-system'

import OnboardingCard from './OnboardingCard'
import OnboardingWrapper from './OnboardingWrapper'

function StatusChip({
  loading, error, progressMessage, ...chip
}) {
  return (
    <Chip
      loading={loading && !error}
      backgroundColor="fill-two"
      borderColor="border-fill-two"
      severity={error ? 'error' : (loading ? 'info' : 'success')}
      {...chip}
    >
      {error ? 'Error' : (loading ? (progressMessage || 'Running') : 'Success')}
    </Chip>
  )
}

export function ShellStatus({
  shell: {
    alive, status: {
      initialized, podScheduled, containersReady, ready,
    },
  }, error,
}) {
  return (
    <Flex
      width="100%"
      maxWidth={640}
      height="100%"
      direction="column"
      alignSelf="center"
      justify="center"
      paddingTop="xxlarge"
      paddingHorizontal="xlarge"
      overflowY="auto"
    >
      <OnboardingWrapper stepIndex={3}>
        <OnboardingCard
          paddingTop="xlarge"
          paddingBottom="xlarge"
        >
          <Flex
            align="center"
            justify="space-between"
          >
            <Div>
              <P
                body1
                color="text"
                fontWeight={600}
              >
                Creating cloud shell environment
              </P>
              <P
                body1
                color="text-light"
              >
                This may take a few minutes.
              </P>
            </Div>
            <StatusChip
              loading={!alive}
              error={error}
              progressMessage="In progress"
              size="large"
            />
          </Flex>
          <ProgressBar
            mode={error || alive ? 'determinate' : 'indeterminate'}
            marginTop="medium"
            progress={error ? 0 : alive ? 100 : null}
            backgroundColor={error ? 'icon-error' : 'fill-two'}
          />
          <Flex
            marginTop="xlarge"
            paddingVertical="medium"
            align="center"
            justify="space-between"
            borderBottom="1px solid border"
          >
            <P
              body2
              color="text"
            >
              Initialized
            </P>
            <StatusChip
              loading={!initialized}
              error={error}
            />
          </Flex>
          <Flex
            paddingVertical="medium"
            align="center"
            justify="space-between"
            borderBottom="1px solid border"
          >
            <P
              body2
              color="text"
            >
              Pod scheduled
            </P>
            <StatusChip
              loading={!podScheduled}
              error={error}
            />
          </Flex>
          <Flex
            paddingVertical="medium"
            align="center"
            justify="space-between"
            borderBottom="1px solid border"
          >
            <P
              body2
              color="text"
            >
              Containers ready
            </P>
            <StatusChip
              loading={!containersReady}
              error={error}
            />
          </Flex>
          <Flex
            paddingVertical="medium"
            align="center"
            justify="space-between"
          >
            <P
              body2
              color="text"
            >
              Ready
            </P>
            <StatusChip
              loading={!ready}
              error={error}
            />
          </Flex>
        </OnboardingCard>
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
                color="text"
                fontWeight={600}
              >
                Join the community
              </P>
              <P
                body1
              >
                Receive support from our team.
              </P>
            </Div>
            <Button
              secondary
              endIcon={(
                <DiscordIcon />
              )}
              as="a"
              href="https://discord.gg/pluralsh"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Discord
            </Button>
          </Flex>
        </OnboardingCard>
      </OnboardingWrapper>
    </Flex>
  )
}
