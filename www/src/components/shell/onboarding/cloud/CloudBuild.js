import { createElement, useContext, useEffect, useRef, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Div, Flex, P } from 'honorable'
import { Button, ProgressBar } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import { CREATE_DEMO_PROJECT_MUTATION, POLL_DEMO_PROJECT_QUERY } from '../../query'

import OnboardingNavSection from '../OnboardingNavSection'
import OnboardingCard from '../OnboardingCard'

function CloudBuild() {
  const { provider, setProvider, workspace, setWorkspace, credentials, setCredentials, previous, next, exceptions } = useContext(CreateShellContext)
  const [createDemoProjectMutation, { data, error }] = useMutation(CREATE_DEMO_PROJECT_MUTATION)
  const [completed, setCompleted] = useState(false)

  useEffect(createDemoProjectMutation, [createDemoProjectMutation])

  return (
    <>
      <OnboardingCard title="Configure cloud credentials">
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
          mode="indeterminate"
          marginTop="medium"
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
