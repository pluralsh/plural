import { Flex } from 'honorable'

import { ProgressBar } from '@pluralsh/design-system'

import {
  Community,
  ErrorWrapper,
  ProgressEntry,
  StatusHeader,
} from '../shell/ShellStatus'

function DemoStatus({ loading, error }): JSX.Element {
  return (
    <Flex
      paddingTop="xsmall"
      direction="column"
    >
      <Flex
        paddingHorizontal="large"
        direction="column"
        gap="medium"
      >
        <StatusHeader
          header="Creating your demo project"
          description="This may take a few minutes."
          errorHeader="Failed to create demo project"
          error={error}
        />

        {!error && (
          <ProgressBar
            mode={!loading ? 'determinate' : 'indeterminate'}
            progress={!loading ? 100 : undefined}
            // @ts-expect-error
            backgroundColor="fill-two"
            marginBottom="medium"
          />
        )}
      </Flex>

      {error && (
        <>
          <ErrorWrapper
            error={error}
            copyButtonProps={{ 'data-phid': 'cloud-shell-error-copy' }}
          />
          <Community />
        </>
      )}

      {!error && (
        <>
          <ProgressEntry
            text="Creating GCP project"
            loading={false}
            error={error}
          />

          <ProgressEntry
            text="Enabling GCP services"
            loading
            error={error}
            last
          />
        </>
      )}
    </Flex>
  )
}

export { DemoStatus }
