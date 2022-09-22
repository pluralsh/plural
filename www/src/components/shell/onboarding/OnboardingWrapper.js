import { Flex } from 'honorable'

import {
  ResponsiveLayoutContentContainer, ResponsiveLayoutSidecarContainer, ResponsiveLayoutSidenavContainer, ResponsiveLayoutSpacer,
} from '../../layout/ResponsiveLayout'

import OnboardingSidenav from './OnboardingSidenav'
import OnboardingSidecar from './OnboardingSidecar'
import OnboardingTitle from './OnboardingTitle'

import SplashToLogoTransition from './SplashToLogoTransition'

function OnboardingWrapper({
  showSplashScreen = false,
  stepIndex = 0,
  childIsReady = true,
  cliMode = false,
  onRestart = () => {},
  children,
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
            position="relative"
            width="100%"
            flexGrow={1}
            overflow="hidden"
          >
            <ResponsiveLayoutSpacer />
            <ResponsiveLayoutSidenavContainer>
              <OnboardingSidenav
                stepIndex={stepIndex}
                cliMode={cliMode}
                onRestart={onRestart}
              />
            </ResponsiveLayoutSidenavContainer>
            <ResponsiveLayoutContentContainer
              overflowY="hidden"
              marginRight-desktop-down={32}
            >
              <OnboardingTitle />
              {children}
            </ResponsiveLayoutContentContainer>
            <ResponsiveLayoutSidecarContainer>
              <OnboardingSidecar />
            </ResponsiveLayoutSidecarContainer>
            <ResponsiveLayoutSpacer />
          </Flex>
        )}
      </SplashToLogoTransition>
    </Flex>
  )
}

export default OnboardingWrapper
