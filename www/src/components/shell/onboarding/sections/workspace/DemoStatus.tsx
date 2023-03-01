import { Flex, P } from 'honorable'
import { Button, DiscordIcon, ProgressBar } from '@pluralsh/design-system'
import { ApolloError } from '@apollo/client/errors'

import { ErrorWrapper, ProgressEntry, StatusHeader } from '../shell/ShellStatus'
import { DemoProject, DemoProjectState } from '../../../../../generated/graphql'

function Community() {
  return (
    <Flex flexDirection="column">
      <Flex
        paddingTop="medium"
        paddingHorizontal="large"
        justify="space-between"
        align="center"
        gap="xxsmall"
      >
        <Flex flexDirection="column">
          <P
            color="text"
            fontWeight={600}
          >
            Contact us
          </P>
          <P color="text-light">
            Message us on Discord and we can help you resolve any issues.
          </P>
        </Flex>
        <Button
          data-phid="cloud-shell-error-discord"
          as="a"
          href="https://discord.gg/pluralsh"
          target="_blank"
          secondary
          startIcon={<DiscordIcon />}
          small
        >Discord
        </Button>
      </Flex>
    </Flex>
  )
}

interface DemoStatusProps {
  loading: boolean
  error?: ApolloError
  project?: DemoProject
}

function DemoStatus({ loading, error, project }: DemoStatusProps): JSX.Element {
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
          header={loading ? 'Creating your demo project' : 'Demo project created'}
          description={loading ? 'This may take a few minutes.' : 'You can continue now to create the cloud shell environment.'}
          errorHeader="Failed to create demo project"
          errorDescription="Try again in a few minutes. If issue does not resolve itself check the logs and try options below to troubleshoot."
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
            loading={!project?.state}
            error={error}
          />

          <ProgressEntry
            text="Enabling GCP services"
            loading={project?.state ? project.state === DemoProjectState.Created : true}
            error={error}
            last
          />
        </>
      )}
    </Flex>
  )
}

export { DemoStatus }
