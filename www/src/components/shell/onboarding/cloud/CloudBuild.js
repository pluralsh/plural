import { useContext, useEffect, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Div, Flex, P } from 'honorable'
import { Button, ProgressBar } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import { CREATE_DEMO_PROJECT_MUTATION, POLL_DEMO_PROJECT_QUERY } from '../../query'

import OnboardingNavSection from '../OnboardingNavSection'
import OnboardingCard from '../OnboardingCard'
import { GqlError } from '../../../utils/Alert'

function CloudBuild() {
  const { previous, next } = useContext(CreateShellContext)
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

  console.log('data', createDemoProjectMutationResults.data, pollDemoProjectQueryResults.data)

  const [completed, setCompleted] = useState(false) // Maybe use a compound bool
  const error = createDemoProjectMutationResults.error || pollDemoProjectQueryResults.error

  useEffect(() => {
    createDemoProjectMutation()
  }, [createDemoProjectMutation])

  return (
    <>
      <OnboardingCard>
        <Flex
          align="center"
          justify="space-between"
        >
          <Div>
            <P body1>
              Creating your demo project
            </P>
            <P
              body1
              color="text-light"
            >
              This may take a few minutes.
            </P>
          </Div>
          Chip here
        </Flex>
        <ProgressBar
          mode={error ? 'determinate' : 'indeterminate'}
          marginTop="medium"
          progress={error ? 0 : null}
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
          Chip here
        </Flex>
        <Flex
          paddingVertical="medium"
          align="center"
          justify="space-between"
        >
          <P body2>
            Enabling GCP services
          </P>
          Chip here
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
        {!!error && (
          <Button
            secondary
            onClick={() => {
              previous()
            }}
          >
            Back
          </Button>
        )}
        {completed && (
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
