import { Outlet } from 'react-router-dom'
import { Flex } from 'honorable'

import {
  ResponsiveLayoutContentContainer,
  ResponsiveLayoutSidecarContainer,
  ResponsiveLayoutSidenavContainer,
  ResponsiveLayoutSpacer,
} from '../../layout/ResponsiveLayout'

import OnboardingTitle from './OnboardingTitle'
import OnboardingSplash from './OnboardingSplash'
import OnboardingSidenav from './OnboardingSidenav'
import OnboardingSidecar from './OnboardingSidecar'

import useStepIndex from './useStepIndex'

function OnboardingRoot() {
  const stepIndex = useStepIndex()

  return (
    <Flex
      width="100%"
      height="100%"
      direction="column"
      alignItems="center"
      paddingTop="xxlarge"
      overflowY="auto"
    >
      <OnboardingSplash
        childIsReady
        showSplashScreen
        splashTimeout={1200}
      >
        <Flex
          position="relative"
          width="100%"
          flexGrow={1}
          overflow="hidden"
        >
          <ResponsiveLayoutSpacer />
          <ResponsiveLayoutSidenavContainer
            marginTop={82}
            marginRight={30}
            paddingRight="xxsmall"
            overflowY="auto"
          >
            <OnboardingSidenav />
          </ResponsiveLayoutSidenavContainer>
          <ResponsiveLayoutContentContainer
            overflowY="auto"
            paddingBottom="large"
            paddingHorizontal="xxsmall"
            marginRight-desktop-down={30}
          >
            <OnboardingTitle />
            <Outlet />
          </ResponsiveLayoutContentContainer>
          <ResponsiveLayoutSidecarContainer
            marginLeft={30}
            marginTop={57}
            marginRight="xlarge"
            overflowY="auto"
          >
            <OnboardingSidecar displayApplications={stepIndex > 0} />
          </ResponsiveLayoutSidecarContainer>
          <ResponsiveLayoutSpacer />
        </Flex>
      </OnboardingSplash>
    </Flex>
  )
}

export default OnboardingRoot
