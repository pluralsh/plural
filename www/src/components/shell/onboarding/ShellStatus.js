import { Div, Flex, P } from 'honorable'
import { Chip, ProgressBar } from 'pluralsh-design-system'

import OnboardingCard from './OnboardingCard'

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
        borderBottom="1px solid border-fill-two"
      >
        <P body2>
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
        borderBottom="1px solid border-fill-two"
      >
        <P body2>
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
        borderBottom="1px solid border-fill-two"
      >
        <P body2>
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
        <P body2>
          Ready
        </P>
        <StatusChip
          loading={!ready}
          error={error}
        />
      </Flex>
    </OnboardingCard>
  )
}
