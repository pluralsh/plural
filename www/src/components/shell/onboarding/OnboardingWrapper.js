import { Div, Flex } from 'honorable'
import { BrowserIcon, CloudIcon, GearTrainIcon, NetworkInterfaceIcon, Stepper } from 'pluralsh-design-system'

import { SECTION_CLOUD_SELECT, SECTION_CLOUD_WORKSPACE, SECTION_GIT_PROVIDER, SECTION_INSTALL_CLI, SECTION_SYNOPSIS } from '../constants'

import SplashToLogoTransition from './SplashToLogoTransition'

function DemoStepper({ stepIndex = 0, ...props }) {
  const steps = [
    { key: SECTION_GIT_PROVIDER, stepTitle: 'Create a repository', IconComponent: NetworkInterfaceIcon },
    { key: SECTION_CLOUD_SELECT, stepTitle: <>Choose a&nbsp;cloud</>, IconComponent: CloudIcon },
    { key: SECTION_CLOUD_WORKSPACE, stepTitle: 'Configure repository', IconComponent: GearTrainIcon },
    { key: SECTION_SYNOPSIS, stepTitle: <>Launch the&nbsp;app</>, IconComponent: BrowserIcon },
  ]

  return (
    <Stepper
      stepIndex={stepIndex}
      steps={steps}
      {...props}
    />
  )
}

function CliStepper({ stepIndex = 0, ...props }) {
  const steps = [
    { key: SECTION_GIT_PROVIDER, stepTitle: 'Create a repository', IconComponent: NetworkInterfaceIcon },
    { key: SECTION_INSTALL_CLI, stepTitle: <>Install CLI</>, IconComponent: CloudIcon },
    { key: SECTION_SYNOPSIS, stepTitle: <>Launch the&nbsp;app</>, IconComponent: BrowserIcon },
  ]

  return (
    <Stepper
      stepIndex={stepIndex}
      steps={steps}
      {...props}
    />
  )
}

function OnboardingWrapper({ showSplashScreen = false, stepIndex = 0, childIsReady = true, children, cliMode = false }) {
  return (
    <Flex
      width="100%"
      direction="column"
      alignItems="center"
      marginTop="xxlarge"
      overflowY="auto"
    >
      <SplashToLogoTransition
        showSplashScreen={showSplashScreen}
        splashTimeout={1200}
        childIsReady={childIsReady}
      >
        {childIsReady && (
          <Div
            position="relative"
            width="100%"
            maxWidth={640}
            zIndex={0}
            marginTop="xlarge"
            paddingHorizontal="xlarge"
          >
            <Div
              marginBottom="xxlarge"
            >
              {(
                cliMode
                  ? <CliStepper stepIndex={stepIndex} />
                  : <DemoStepper stepIndex={stepIndex} />
              )}
            </Div>
            {children}
          </Div>
        )}
      </SplashToLogoTransition>
    </Flex>
  )
}

export default OnboardingWrapper
