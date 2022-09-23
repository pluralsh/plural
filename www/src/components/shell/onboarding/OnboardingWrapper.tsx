import { useEffect, useMemo, useState } from 'react'
import { Flex } from 'honorable'

import {
  ResponsiveLayoutContentContainer, ResponsiveLayoutSidecarContainer, ResponsiveLayoutSidenavContainer, ResponsiveLayoutSpacer,
} from '../../layout/ResponsiveLayout'

import SelectedApplicationsContext, { SelectedApplicationsContextType } from '../../../contexts/SelectedApplicationsContext'

import { SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY } from '../constants'

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
  const [selectedApplications, setSelectedApplications] = useState<any[]>([])
  const selectedApplicationsContextValue = useMemo<SelectedApplicationsContextType>(() => ({ selectedApplications, setSelectedApplications }), [selectedApplications])

  useEffect(() => {
    localStorage.setItem(SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY, JSON.stringify(selectedApplications))
  }, [selectedApplications])

  return (
    <SelectedApplicationsContext.Provider value={selectedApplicationsContextValue}>
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
                <OnboardingSidecar areApplicationsDisplayed={stepIndex > 0} />
              </ResponsiveLayoutSidecarContainer>
              <ResponsiveLayoutSpacer />
            </Flex>
          )}
        </SplashToLogoTransition>
      </Flex>
    </SelectedApplicationsContext.Provider>
  )
}

export default OnboardingWrapper
