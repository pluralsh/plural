import { Div, Flex, P } from 'honorable'
import { Chip, ProgressBar } from 'pluralsh-design-system'

import OnboardingCard from './OnboardingCard'

function StatusChip({
  loading, error, progressMessage, ...chip
}: any) {
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
}: any) {
  return (
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
        // @ts-expect-error
        marginTop="medium"
        progress={error ? 0 : alive ? 100 : undefined}
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
  )
}
