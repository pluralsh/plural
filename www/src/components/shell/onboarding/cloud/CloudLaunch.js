import { useContext, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Div, Flex, P } from 'honorable'
import { Button, Chip, DiscordIcon, ProgressBar } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import { CLOUD_SHELL_QUERY, CREATE_SHELL_MUTATION } from '../../query'

import OnboardingNavSection from '../OnboardingNavSection'
import OnboardingCard from '../OnboardingCard'
import { GqlError } from '../../../utils/Alert'

function CloudLaunch() {
  const {
    scm,
    provider,
    workspace,
    credentials,
    demoId,
    next,
    previous,
  } = useContext(CreateShellContext)

  const [createShellMutation, createShellMutationResults] = useMutation(
    CREATE_SHELL_MUTATION,
    {
      variables: {
        attributes: {
          credentials,
          workspace: {
            ...workspace,
            subdomain: `${workspace.subdomain}.onplural.sh`,
          },
          scm,
          provider,
          demoId,
        },
      },
    }
  )
  const { data, error } = useQuery(
    CLOUD_SHELL_QUERY,
    {
      pollInterval: 2000,
      skip: !createShellMutationResults?.data,
    }
  )

  useEffect(() => {
    createShellMutation()
  }, [createShellMutation])

  const { alive } = data?.shell || {}
  const {
    initialized,
    podScheduled,
    containersReady,
    ready,
  } = data?.shell?.status || {}

  return (
    <>
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
            severity={ready ? 'success' : 'info'}
          >
            {ready ? 'Success' : 'Running'}
          </Chip>
        </Flex>
      </OnboardingCard>
      {!!error && (
        <Div marginTop="medium">
          <GqlError
            header="Error while creating demo project"
            error={error}
          />
        </Div>
      )}
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
            endIcon={(
              <DiscordIcon />
            )}
            as="a"
            href="https://discord.gg/qQqQqQq"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join Discord
          </Button>
        </Flex>
      </OnboardingCard>
      {/* Navigation */}
      <OnboardingNavSection>
        <Button
          secondary
          onClick={() => {
            previous()
          }}
        >
          Back
        </Button>
        <Button
          disabled={!alive}
          onClick={() => {
            next()
          }}
        >
          Launch cloud shell
        </Button>
      </OnboardingNavSection>

    </>
  )
}

export default CloudLaunch
