import { Div, Flex } from 'honorable'
import { BrowserIcon, CloudIcon, GearTrainIcon, NetworkInterfaceIcon, Stepper } from 'pluralsh-design-system'

import { SECTION_CLOUD, SECTION_FINISH, SECTION_GIT, SECTION_INSTALL_CLI, SECTION_WORKSPACE } from '../constants'

import SplashToLogoTransition from './SplashToLogoTransition'

function DemoStepper({ stepIndex = 0, ...props }) {
  const steps = [
    { key: SECTION_GIT, stepTitle: 'Create a repository', IconComponent: NetworkInterfaceIcon },
    { key: SECTION_CLOUD, stepTitle: <>Choose a&nbsp;cloud</>, IconComponent: CloudIcon },
    { key: SECTION_WORKSPACE, stepTitle: 'Configure repository', IconComponent: GearTrainIcon },
    { key: SECTION_FINISH, stepTitle: <>Launch the&nbsp;app</>, IconComponent: BrowserIcon },
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
    { key: SECTION_GIT, stepTitle: 'Create a repository', IconComponent: NetworkInterfaceIcon },
    { key: SECTION_INSTALL_CLI, stepTitle: <>Install CLI</>, IconComponent: CloudIcon },
    { key: SECTION_FINISH, stepTitle: <>Launch the&nbsp;app</>, IconComponent: BrowserIcon },
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
