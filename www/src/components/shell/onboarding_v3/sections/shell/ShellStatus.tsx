import { Div, Flex, P } from 'honorable'
import { Button, Chip, ProgressBar } from '@pluralsh/design-system'

import { useCallback, useContext } from 'react'

import { OnboardingContext } from '../../context/onboarding'

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
  const { setSection } = useContext(OnboardingContext)
  const onBack = useCallback(() => setSection(s => ({ ...s, state: undefined })), [setSection])

  return (
    <Flex
      paddingTop="xsmall"
      direction="column"
      gap="medium"
    >
      <Flex
        paddingHorizontal="large"
        direction="column"
        gap="medium"
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
            The cloud shell will boot automatically upon completion.
          </P>
        </Div>

        <ProgressBar
          mode={error || alive ? 'determinate' : 'indeterminate'}
          progress={error ? 0 : alive ? 100 : undefined}
          backgroundColor={error ? 'icon-error' : 'fill-two'}
        />
      </Flex>

      <Flex
        paddingVertical="medium"
        paddingHorizontal="large"
        align="center"
        justify="space-between"
        borderBottom="1px solid border"
      >
        <P
          body2
          color="text"
        >
          Initialize
        </P>
        <StatusChip
          loading={!initialized}
          error={error}
        />
      </Flex>

      <Flex
        paddingBottom="medium"
        paddingHorizontal="large"
        align="center"
        justify="space-between"
        borderBottom="1px solid border"
      >
        <P
          body2
          color="text"
        >
          Schedule pods
        </P>
        <StatusChip
          loading={!podScheduled}
          error={error}
        />
      </Flex>

      <Flex
        paddingBottom="medium"
        paddingHorizontal="large"
        align="center"
        justify="space-between"
        borderBottom="1px solid border"
      >
        <P
          body2
          color="text"
        >
          Create containers
        </P>
        <StatusChip
          loading={!containersReady}
          error={error}
        />
      </Flex>

      <Flex
        paddingHorizontal="large"
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

      <Flex
        gap="medium"
        justify="space-between"
        borderTop="1px solid border"
        paddingTop="large"
        paddingBottom="xsmall"
        paddingHorizontal="large"
      >
        <Button
          secondary
          onClick={onBack}
        >Back
        </Button>
        <Button>
          Restart Build
        </Button>
      </Flex>
    </Flex>
  )
}
