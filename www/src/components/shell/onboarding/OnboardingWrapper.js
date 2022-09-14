import { Div, Flex } from 'honorable'
import {
  BrowserIcon, CloudIcon, GearTrainIcon, NetworkInterfaceIcon, Stepper,
} from 'pluralsh-design-system'

import {
  SECTION_CLI_INSTALLATION, SECTION_CLOUD_SELECT, SECTION_CLOUD_WORKSPACE, SECTION_GIT_PROVIDER, SECTION_SYNOPSIS,
} from '../constants'

import OnboardingFooter from './OnboardingFooter'

import SplashToLogoTransition from './SplashToLogoTransition'

function DemoStepper({ stepIndex = 0, ...props }) {
  const steps = [
    { key: SECTION_GIT_PROVIDER, stepTitle: 'Create a repository', IconComponent: NetworkInterfaceIcon },
    { key: SECTION_CLOUD_SELECT, stepTitle: <>Choose a&nbsp;cloud</>, IconComponent: CloudIcon },
    { key: SECTION_CLOUD_WORKSPACE, stepTitle: 'Configure workspace', IconComponent: GearTrainIcon },
    { key: SECTION_SYNOPSIS, stepTitle: 'Launch cloud shell', IconComponent: BrowserIcon },
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
    { key: SECTION_CLI_INSTALLATION, stepTitle: <>Install CLI</>, IconComponent: CloudIcon },
    { key: SECTION_SYNOPSIS, stepTitle: <>Launch cloud&nbsp;shell</>, IconComponent: BrowserIcon },
  ]

  return (
    <Stepper
      stepIndex={stepIndex}
      steps={steps}
      {...props}
    />
  )
}

function OnboardingWrapper({
  showSplashScreen = false, stepIndex = 0, childIsReady = true, children, cliMode = false,
}) {
  return (
    <Flex
      width="100%"
      height="100%"
      direction="column"
      alignItems="center"
      paddingTop="xxlarge"
      overflowY="auto"
    >
      <SplashToLogoTransition
        showSplashScreen={showSplashScreen}
        splashTimeout={1200}
        childIsReady={childIsReady}
      >
        {childIsReady && (
          <Flex
            direction="column"
            position="relative"
            height="100%"
            width="100%"
            maxWidth={640}
            zIndex={0}
            marginTop="xlarge"
            paddingHorizontal="xlarge"
          >
            {/* <Div
              marginBottom="xxlarge"
            >
              {(
                cliMode
                  ? <CliStepper stepIndex={stepIndex} />
                  : <DemoStepper stepIndex={stepIndex} />
              )}
            </Div> */}
            {children}
            <Flex
              direction="column"
              height="100%"
            />
            <OnboardingFooter />
          </Flex>
        )}
      </SplashToLogoTransition>
    </Flex>
  )
}

export default OnboardingWrapper
