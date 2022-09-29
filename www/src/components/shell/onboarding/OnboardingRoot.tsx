import { Outlet } from 'react-router-dom'
import { Flex } from 'honorable'

import { useMemo } from 'react'

import OnboardingContext, { OnboardigContextType } from '../../../contexts/OnboardingContext'

import {
  ResponsiveLayoutContentContainer,
  ResponsiveLayoutSidecarContainer,
  ResponsiveLayoutSidenavContainer,
  ResponsiveLayoutSpacer,
} from '../../layout/ResponsiveLayout'

import {
  usePersistedApplications,
  usePersistedConsole,
  usePersistedProvider,
  usePersistedStack,
  usePersistedTerminalOnboardingSidebar,
} from '../usePersistance'

import OnboardingTitle from './OnboardingTitle'
import OnboardingSplash from './OnboardingSplash'
import OnboardingSidenav from './OnboardingSidenav'
import OnboardingSidecar from './OnboardingSidecar'

import useStepIndex from './useStepIndex'

function OnboardingRoot() {
  const stepIndex = useStepIndex()
  const [applications, setApplications] = usePersistedApplications()
  const [provider, setProvider] = usePersistedProvider()
  const [stack, setStack] = usePersistedStack()
  const [console, setConsole] = usePersistedConsole() // Wether to install the console or not
  const [terminalOnboardingSidebar, setTerminalOnboardingSidebar] = usePersistedTerminalOnboardingSidebar() // Wether to force the display of the demo in the terminal sidebar
  const onboardingContextValue = useMemo<OnboardigContextType>(() => ({
    applications,
    setApplications,
    provider,
    setProvider,
    stack,
    setStack,
    console,
    setConsole,
    terminalOnboardingSidebar,
    setTerminalOnboardingSidebar,
  }), [
    applications,
    setApplications,
    provider,
    setProvider,
    stack,
    setStack,
    console,
    setConsole,
    terminalOnboardingSidebar,
    setTerminalOnboardingSidebar,
  ])

  return (
    <OnboardingContext.Provider value={onboardingContextValue}>
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
    </OnboardingContext.Provider>
  )
}

export default OnboardingRoot
