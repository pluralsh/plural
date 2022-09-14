import { Flex } from 'honorable'

import {
  ResponsiveLayoutContentContainer, ResponsiveLayoutSidecarContainer, ResponsiveLayoutSidenavContainer, ResponsiveLayoutSpacer,
} from '../../layout/ResponsiveLayout'

import OnboardingSidenav from './OnboardingSidenav'
import OnboardingSidecar from './OnboardingSidecar'
import OnboardingTitle from './OnboardingTitle'
import OnboardingFooter from './OnboardingFooter'

import SplashToLogoTransition from './SplashToLogoTransition'

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
          <Flex direction="column">
            <OnboardingTitle />
            <Flex
              position="relative"
              height="100%"
              width="100%"
            >
              <ResponsiveLayoutSpacer />
              <ResponsiveLayoutSidenavContainer>
                <OnboardingSidenav
                  stepIndex={stepIndex}
                  cliMode={cliMode}
                />
              </ResponsiveLayoutSidenavContainer>
              <ResponsiveLayoutContentContainer>
                {children}
              </ResponsiveLayoutContentContainer>
              <ResponsiveLayoutSidecarContainer>
                <OnboardingSidecar />
              </ResponsiveLayoutSidecarContainer>
              <ResponsiveLayoutSpacer />
              {/* <Div
              marginBottom="xxlarge"
            >
              {(
                cliMode
                  ? <CliStepper stepIndex={stepIndex} />
                  : <DemoStepper stepIndex={stepIndex} />
              )}
            </Div> */}
            </Flex>
          </Flex>
        )}
      </SplashToLogoTransition>
    </Flex>
  )
}

export default OnboardingWrapper
