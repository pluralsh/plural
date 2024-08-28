import { Button, Divider, Flex } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

import {
  cloudSteps,
  localSteps,
  useCreateClusterContext,
} from './CreateClusterWizard'

export function CreateClusterActions() {
  const theme = useTheme()
  const { curStep, setCurStep, hostingOption, finishEnabled } =
    useCreateClusterContext()

  const steps = hostingOption === 'local' ? localSteps : cloudSteps
  const curStepIndex = steps.findIndex((step) => step.key === curStep)
  const prevStep = steps[curStepIndex - 1]?.key
  const nextStep = steps[curStepIndex + 1]?.key

  const handleFinish = () => {
    // TODO
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
            <Button onClick={() => setCurStep(nextStep)}>Continue</Button>
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
