import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Flex } from 'honorable'
import { useTheme } from 'styled-components'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { LoopingLogo } from '@pluralsh/design-system'

import { ResponsiveLayoutContentContainer } from '../../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutSidecarContainer } from '../../utils/layout/ResponsiveLayoutSidecarContainer'
import { ResponsiveLayoutSpacer } from '../../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutSidenavContainer } from '../../utils/layout/ResponsiveLayoutSidenavContainer'
import SelectedApplicationsContext, { SelectedApplicationsContextType } from '../../../contexts/SelectedApplicationsContext'
import { persistApplications, retrieveApplications } from '../persistance'
import { SEARCH_REPOS } from '../../repos/queries'
import { RootQueryType } from '../../../generated/graphql'
import { useDevTokenInputSecretCode } from '../useDevToken'

import OnboardingSidenav from './OnboardingSidenav'
import OnboardingSidecar from './OnboardingSidecar'
import OnboardingTitle from './OnboardingTitle'

function OnboardingWrapper({
  stepIndex = 0,
  cliMode = false,
  onRestart = () => {},
  children,
}: any) {
  useDevTokenInputSecretCode()

  const theme = useTheme()
  const [searchParams] = useSearchParams()
  const appName = searchParams.get('appName')
  const [selectedApplications, setSelectedApplications] = useState<any[]>(retrieveApplications())
  const selectedApplicationsContextValue = useMemo<SelectedApplicationsContextType>(() => ({ selectedApplications, setSelectedApplications }), [selectedApplications])
  const { data, loading, error } = useQuery<RootQueryType>(SEARCH_REPOS, { variables: { query: appName }, skip: !appName })

  const handleRestart = useCallback(() => {
    setSelectedApplications([])
    onRestart()
  }, [onRestart])

  useEffect(() => {
    persistApplications(selectedApplications)
  }, [selectedApplications])

  useEffect(() => {
    if (error) return

    const app = data?.searchRepositories?.edges?.at(0)?.node

    if (!app) return

    setSelectedApplications([app])
  }, [error, data])

  if (appName && loading) {
    return (
      <Flex
        grow={1}
        align="center"
        justify="center"
      ><LoopingLogo />
      </Flex>
    )
  }

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
            marginRight={theme.spacing.xlarge - theme.spacing.small}
            marginLeft="xlarge"
            paddingRight="small"
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
