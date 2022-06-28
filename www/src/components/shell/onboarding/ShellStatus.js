import { Div, Flex, P } from 'honorable'
import { Chip, ProgressBar } from 'pluralsh-design-system'

import OnboardingCard from './OnboardingCard'

export function ShellStatus({ shell: { alive, status: { initialized, podScheduled, containersReady, ready } }, error }) {
  return (
    <OnboardingCard>
      <Flex
        align="center"
        justify="space-between"
      >
        <Div>
          <P
            body1
            bold
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
        <Chip
          size="large"
          backgroundColor="fill-two"
          severity={alive ? 'success' : 'info'}
        >
          {alive ? 'Success' : 'In progress'}
        </Chip>
      </Flex>
      <ProgressBar
        mode={error || alive ? 'determinate' : 'indeterminate'}
        marginTop="medium"
        progress={error ? 0 : alive ? 100 : null}
        backgroundColor={error ? 'icon-error' : null}
      />
      <Flex
        marginTop="xlarge"
        paddingVertical="medium"
        align="center"
        justify="space-between"
        borderBottom="1px solid border-fill-two"
      >
        <P body2>
          Initialized
        </P>
        <Chip
          loading={!initialized}
          backgroundColor="fill-two"
          severity={initialized ? 'success' : 'info'}
        >
          {initialized ? 'Success' : 'Running'}
        </Chip>
      </Flex>
      <Flex
        paddingVertical="medium"
        align="center"
        justify="space-between"
        borderBottom="1px solid border-fill-two"
      >
        <P body2>
          Pod scheduled
        </P>
        <Chip
          loading={!podScheduled}
          backgroundColor="fill-two"
          severity={podScheduled ? 'success' : 'info'}
        >
          {podScheduled ? 'Success' : 'Running'}
        </Chip>
      </Flex>
      <Flex
        paddingVertical="medium"
        align="center"
        justify="space-between"
        borderBottom="1px solid border-fill-two"
      >
        <P body2>
          Containers ready
        </P>
        <Chip
          loading={!containersReady}
          backgroundColor="fill-two"
          severity={containersReady ? 'success' : 'info'}
        >
          {containersReady ? 'Success' : 'Running'}
        </Chip>
      </Flex>
      <Flex
        paddingVertical="medium"
        align="center"
        justify="space-between"
      >
        <P body2>
          Ready
        </P>
        <Chip
          loading={!ready}
          backgroundColor="fill-two"
          severity={ready ? 'success' : 'info'}
        >
          {ready ? 'Success' : 'Running'}
        </Chip>
      </Flex>
    </OnboardingCard>
  )
}
