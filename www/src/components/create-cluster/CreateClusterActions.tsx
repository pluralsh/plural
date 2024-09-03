import { Button, Divider, Flex } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

import { useNavigate } from 'react-router-dom'

import {
  cloudSteps,
  localSteps,
  useCreateClusterContext,
} from './CreateClusterWizard'

export const NEW_CONSOLE_INSTANCE_KEY = 'new-console-instance'

export function CreateClusterActions() {
  const theme = useTheme()
  const navigate = useNavigate()
  const {
    curStep,
    setCurStep,
    hostingOption,
    finishEnabled,
    continueBtn,
    consoleInstanceId,
  } = useCreateClusterContext()

  const steps = hostingOption === 'local' ? localSteps : cloudSteps
  const curStepIndex = steps.findIndex((step) => step.key === curStep)
  const prevStep = steps[curStepIndex - 1]?.key
  const nextStep = steps[curStepIndex + 1]?.key

  const handleFinish = () => {
    if (consoleInstanceId) {
      localStorage.setItem(NEW_CONSOLE_INSTANCE_KEY, consoleInstanceId)
    }
    navigate(
      `/overview/clusters/${
        hostingOption === 'local' ? 'self-hosted' : 'plural-cloud'
      }`
    )
  }

  return (
    <>
      <Divider
        backgroundColor={theme.colors.border}
        margin={`${theme.spacing.large}px 0`}
      />
      <Flex
        gap="medium"
        justifyContent="space-between"
        alignItems="center"
      >
        <Button
          secondary
          as="a"
          href="https://docs.plural.sh/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read docs
        </Button>
        <Flex gap="medium">
          {prevStep && (
            <Button
              secondary
              onClick={() => setCurStep(prevStep)}
            >
              Back
            </Button>
          )}
          {nextStep ? (
            continueBtn || (
              <Button onClick={() => setCurStep(nextStep)}>Continue</Button>
            )
          ) : (
            <Button
              disabled={!finishEnabled}
              onClick={handleFinish}
            >
              Finish
            </Button>
          )}
        </Flex>
      </Flex>
    </>
  )
}
