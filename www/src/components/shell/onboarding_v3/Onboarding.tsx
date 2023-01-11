import { Flex } from 'honorable'
import { useTheme } from 'styled-components'
import {
  ReactElement,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { ResponsiveLayoutContentContainer, ResponsiveLayoutSidenavContainer, ResponsiveLayoutSpacer } from '../../layout/ResponsiveLayout'
import { useDevTokenInputSecretCode } from '../useDevToken'

import { AuthorizationUrl, RootQueryType, ScmProvider } from '../../../generated/graphql'

import OnboardingHeader from './OnboardingHeader'
import OnboardingSidenav from './OnboardingSidenav'
import { OnboardingFlow } from './OnboardingFlow'
import { ContextProps, OnboardingContext } from './context/onboarding'
import { defaultSections } from './context/hooks'
import {
  CloudProps,
  SCMProps,
  Section,
  SectionKey,
  Sections,
  WorkspaceProps,
} from './context/types'

function Onboarding() {
  useDevTokenInputSecretCode()

  const theme = useTheme()
  const { section, setSection } = useContext(OnboardingContext)
  const navigate = useNavigate()

  return (
    <Flex
      width="100%"
      height="100%"
      direction="column"
      alignItems="center"
      overflowY="auto"
    >
      <OnboardingHeader onRestart={() => navigate('/shell')} />
      <Flex
        position="relative"
        width="100%"
        flexGrow={1}
        overflow="hidden"
        marginTop="xxxlarge"
      >
        <ResponsiveLayoutSpacer />
        <ResponsiveLayoutSidenavContainer
          marginRight={theme.spacing.xlarge - theme.spacing.small}
          marginLeft="xlarge"
          paddingRight="small"
          overflowY="auto"
          flexShrink={0}
        >
          <OnboardingSidenav section={section} />
        </ResponsiveLayoutSidenavContainer>
        <ResponsiveLayoutContentContainer
          overflowY="auto"
          paddingBottom="large"
          paddingHorizontal="xxsmall"
          marginRight="xlarge"
          marginRight-desktop-down={theme.spacing.large}
        >
          <OnboardingFlow
            onNext={() => setSection(section.next || section)}
            onBack={() => setSection(section.prev || section)}
          />
        </ResponsiveLayoutContentContainer>
        <ResponsiveLayoutSpacer />
      </Flex>
    </Flex>
  )
}

interface OnboardingProps {
  accessToken?: string
  provider?: ScmProvider;
  authUrlData?: RootQueryType
}

function OnboardingWithContext({
  accessToken, provider, authUrlData, ...props
}: OnboardingProps): ReactElement {
  const [scm, setSCM] = useState<SCMProps>({
    token: accessToken,
    provider,
    authUrls: authUrlData?.scmAuthorization as Array<AuthorizationUrl>,
  })
  const [valid, setValid] = useState<boolean>(true)
  const [cloud, setCloud] = useState<CloudProps>({} as CloudProps)
  const [sections, setSections] = useState<Sections>(defaultSections())
  const [section, setSection] = useState<Section>(sections[SectionKey.CREATE_REPOSITORY]!)
  const [workspace, setWorkspace] = useState<WorkspaceProps>({} as WorkspaceProps)

  const context = useMemo<ContextProps>(() => ({
    scm,
    setSCM,
    cloud,
    setCloud,
    valid,
    setValid,
    sections,
    setSections,
    section,
    setSection,
    workspace,
    setWorkspace,
  }), [scm, cloud, valid, sections, section, workspace])

  return (
    <OnboardingContext.Provider value={context}>
      <Onboarding {...props} />
    </OnboardingContext.Provider>
  )
}

export { OnboardingWithContext as Onboarding }
