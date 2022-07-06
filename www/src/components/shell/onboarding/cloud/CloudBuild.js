import { useContext, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Div, Flex, P } from 'honorable'
import { Button, Chip, ProgressBar } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import OnboardingTips from '../OnboardingTips'

import { CREATE_DEMO_PROJECT_MUTATION, POLL_DEMO_PROJECT_QUERY } from '../../query'

import OnboardingNavSection from '../OnboardingNavSection'
import OnboardingCard from '../OnboardingCard'
import { GqlError } from '../../../utils/Alert'

function CloudBuild() {
  const { previous, next, setWorkspace, setProvider, setCredentials, setDemoId } = useContext(CreateShellContext)
  const [mutation, mutationResults] = useMutation(CREATE_DEMO_PROJECT_MUTATION)
  const results = useQuery(
    POLL_DEMO_PROJECT_QUERY,
    {
      variables: {
        id: mutationResults?.data?.createDemoProject?.id,
      },
      pollInterval: 2000,
      skip: !!mutationResults.error || !mutationResults.data,
    }
  )

  const status = results?.data?.demoProject?.state
  const error = mutationResults.error || results?.error

  useEffect(() => {
    mutation()
  }, [mutation])

  useEffect(() => {
    console.log(results)
    if (results?.data?.demoProject?.ready && results?.data?.demoProject?.state === 'ENABLED') {
      const demo = results.data.demoProject
      setDemoId(demo.id)
      setProvider('GCP')
      setCredentials({ gcp: { applicationCredentials: demo.credentials } })
      setWorkspace(wk => ({ 
        ...wk, 
        project: demo.projectId,
        region: 'us-east1',
        cluster: 'plural-demo-cluster',
        bucketPrefix: `plural-${Math.random().toString().substring(2, 8)}`,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results])

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
            borderColor="border-fill-two"
            severity={status === 'ENABLED' ? 'success' : 'info'}
          >
            {status === 'ENABLED' ? 'Success' : 'In progress'}
          </Chip>
        </Flex>
        <ProgressBar
          mode={error || status === 'ENABLED' ? 'determinate' : 'indeterminate'}
          marginTop="medium"
          progress={error ? 0 : status === 'ENABLED' ? 100 : null}
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
            Creating GCP project
          </P>
          <Chip
            loading={!status}
            backgroundColor="fill-two"
            borderColor="border-fill-two"
            severity={['CREATED', 'READY', 'ENABLED'].includes(status) ? 'success' : 'info'}
          >
            {['CREATED', 'READY', 'ENABLED'].includes(status) ? 'Success' : 'Running'}
          </Chip>
        </Flex>
        <Flex
          paddingTop="medium"
          align="center"
          justify="space-between"
        >
          <P body2>
            Enabling GCP services
          </P>
          <Chip
            loading={status === 'CREATED'}
            backgroundColor="fill-two"
            borderColor="border-fill-two"
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
      <OnboardingTips marginTop="large" />
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
