import { Button, Divider, Flex } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

import { useNavigate } from 'react-router-dom'

import { useBillingSubscription } from 'components/account/billing/BillingSubscriptionProvider'

import {
  CreateClusterStepKey,
  cloudSteps,
  localSteps,
  useCreateClusterContext,
} from './CreateClusterWizard'
import { clearCreateClusterState } from './CreateCluster'

export const FINISHED_CONSOLE_INSTANCE_KEY = 'plural-finished-console-instance'
export const FINISHED_LOCAL_CREATE_KEY = 'plural-finished-local-create'

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

  const { isPaidPlan, isTrialPlan, isTrialExpired } = useBillingSubscription()
  const disableContinue =
    hostingOption === 'cloud' &&
    ((!isPaidPlan && !isTrialPlan) || (isTrialPlan && isTrialExpired))

  const steps = hostingOption === 'local' ? localSteps : cloudSteps
  const curStepIndex = steps.findIndex((step) => step.key === curStep)
  const prevStep = steps[curStepIndex - 1]?.key
  const nextStep = steps[curStepIndex + 1]?.key

  const handleFinish = () => {
    if (consoleInstanceId) {
      localStorage.setItem(FINISHED_CONSOLE_INSTANCE_KEY, consoleInstanceId)
    }
    if (hostingOption === 'local') {
      localStorage.setItem(FINISHED_LOCAL_CREATE_KEY, 'true')
    }
    clearCreateClusterState()
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
          {prevStep &&
            !(
              hostingOption === 'cloud' &&
              curStep === CreateClusterStepKey.InstallCli
            ) && (
              <Button
                secondary
                onClick={() => setCurStep(prevStep)}
              >
                Back
              </Button>
            )}
          {nextStep ? (
            continueBtn || (
              <Button
                disabled={disableContinue}
                onClick={() => setCurStep(nextStep)}
              >
                Continue
              </Button>
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
