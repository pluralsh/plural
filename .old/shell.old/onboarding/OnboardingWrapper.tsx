import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Flex } from 'honorable'

import { useTheme } from 'styled-components'

import {
  ResponsiveLayoutContentContainer,
  ResponsiveLayoutSidecarContainer,
  ResponsiveLayoutSidenavContainer,
  ResponsiveLayoutSpacer,
} from '../../layout/ResponsiveLayout'

import SelectedApplicationsContext, { SelectedApplicationsContextType } from '../../../contexts/SelectedApplicationsContext'

import { persistApplications, retrieveApplications } from '../persistance'

import OnboardingSidenav from './OnboardingSidenav'
import OnboardingSidecar from './OnboardingSidecar'
import OnboardingTitle from './OnboardingTitle'

function OnboardingWrapper({
  stepIndex = 0,
  cliMode = false,
  onRestart = () => {},
  children,
}) {
  const theme = useTheme()
  const [selectedApplications, setSelectedApplications] = useState<any[]>(retrieveApplications())
  const selectedApplicationsContextValue = useMemo<SelectedApplicationsContextType>(() => ({ selectedApplications, setSelectedApplications }), [selectedApplications])

  const handleRestart = useCallback(() => {
    setSelectedApplications([])
    onRestart()
  }, [onRestart])

  useEffect(() => {
    persistApplications(selectedApplications)
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
        <Flex
          position="relative"
          width="100%"
          flexGrow={1}
          overflow="hidden"
        >
          <ResponsiveLayoutSpacer />
          <ResponsiveLayoutSidenavContainer
            marginRight="xlarge"
            marginLeft="xlarge"
            overflowY="auto"
            flexShrink={0}
          >
            <OnboardingSidenav
              stepIndex={stepIndex}
              cliMode={cliMode}
              onRestart={handleRestart}
            />
          </ResponsiveLayoutSidenavContainer>
          <ResponsiveLayoutContentContainer
            overflowY="auto"
            paddingBottom="large"
            paddingHorizontal="xxsmall"
            marginRight="xlarge"
            marginRight-desktop-down={theme.spacing.large}
          >
            <OnboardingTitle />
            {children}
          </ResponsiveLayoutContentContainer>
          <ResponsiveLayoutSidecarContainer
            marginLeft={0}
            marginTop={67}
            marginRight="large"
            overflowY="auto"
            flexShrink={0}
          >
            <OnboardingSidecar areApplicationsDisplayed={stepIndex > 0} />
          </ResponsiveLayoutSidecarContainer>
          <ResponsiveLayoutSpacer />
        </Flex>
      </Flex>
    </SelectedApplicationsContext.Provider>
  )
}

export default OnboardingWrapper
