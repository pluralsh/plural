import { useContext, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Div, Flex, P } from 'honorable'
import { Button, Chip, ProgressBar } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import { CREATE_DEMO_PROJECT_MUTATION, POLL_DEMO_PROJECT_QUERY } from '../../query'

import OnboardingNavSection from '../OnboardingNavSection'
import OnboardingCard from '../OnboardingCard'
import { GqlError } from '../../../utils/Alert'

function CloudBuild() {
  const { previous, next, setWorkspace, setDemoId } = useContext(CreateShellContext)
  const [createDemoProjectMutation, createDemoProjectMutationResults] = useMutation(CREATE_DEMO_PROJECT_MUTATION)
  const pollDemoProjectQueryResults = useQuery(
    POLL_DEMO_PROJECT_QUERY,
    {
      variables: {
        id: createDemoProjectMutationResults.data?.createDemoProject?.id,
      },
      pollInterval: 2000,
      skip: !!createDemoProjectMutationResults.error || !createDemoProjectMutationResults.data,
    }
  )

  const status = pollDemoProjectQueryResults.data?.demoProject?.state
  const error = createDemoProjectMutationResults.error || pollDemoProjectQueryResults.error

  useEffect(() => {
    createDemoProjectMutation()
  }, [createDemoProjectMutation])

  useEffect(() => {
    setWorkspace(x => ({
      ...x,
      region: 'us-east1',
      cluster: 'plural-demo-cluster',
      bucketPrefix: `plural-${Math.random().toString().substring(2, 8)}`,
    }))
  }, [setWorkspace])

  useEffect(() => {
    setDemoId(createDemoProjectMutationResults.data?.createDemoProject?.id)
  }, [setDemoId, createDemoProjectMutationResults.data?.createDemoProject?.id])

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
              Creating your demo project
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
            severity={status === 'ENABLED' ? 'success' : 'info'}
          >
            {status === 'ENABLED' ? 'Success' : 'In progress'}
          </Chip>
        </Flex>
        <ProgressBar
          mode={error || status === 'ENABLED' ? 'determinate' : 'indeterminate'}
          marginTop="medium"
          progress={error ? 0 : status === 'ENABLED' ? 100 : null}
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
            Creating GCP project
          </P>
          <Chip
            loading={!status}
            backgroundColor="fill-two"
            severity={['CREATED', 'READY', 'ENABLED'].includes(status) ? 'success' : 'info'}
          >
            {['CREATED', 'READY', 'ENABLED'].includes(status) ? 'Success' : 'Running'}
          </Chip>
        </Flex>
        <Flex
          paddingVertical="medium"
          align="center"
          justify="space-between"
        >
          <P body2>
            Enabling GCP services
          </P>
          <Chip
            loading={status === 'CREATED'}
            backgroundColor="fill-two"
            severity={status === 'CREATED' ? 'info' : status === 'ENABLED' | status === 'READY' ? 'success' : 'neutral'}
          >
            {status === 'CREATED' ? 'Running' : status === 'ENABLED' | status === 'READY' ? 'Success' : 'Pending'}
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
      {/* Navigation */}
      <OnboardingNavSection>
        {(!!error || status === 'ENABLED') && (
          <Button
            secondary
            onClick={() => {
              previous()
            }}
          >
            Back
          </Button>
        )}
        {status === 'ENABLED' && (
          <Button
            onClick={() => {
              next()
            }}
          >
            Continue
          </Button>
        )}
      </OnboardingNavSection>

    </>
  )
}

export default CloudBuild
