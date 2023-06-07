import { Flex } from 'honorable'
import { useTheme } from 'styled-components'
import { Dispatch, ReactElement, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import IsEmpty from 'lodash/isEmpty'

import { useDevTokenInputSecretCode } from '../hooks/useDevToken'
import useOnboarded from '../hooks/useOnboarded'
import { ResponsiveLayoutSpacer } from '../../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutContentContainer } from '../../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutSidenavContainer } from '../../utils/layout/ResponsiveLayoutSidenavContainer'

import OnboardingHeader from './OnboardingHeader'
import OnboardingSidenav from './OnboardingSidenav'
import { OnboardingFlow } from './OnboardingFlow'
import { ContextProps, OnboardingContext } from './context/onboarding'
import { defaultSections, useContextStorage, useSection } from './context/hooks'
import {
  CloudProps,
  CreateCloudShellSectionState,
  SCMProps,
  Section,
  SectionKey,
  Sections,
  WorkspaceProps,
} from './context/types'

function Onboarding({
  active,
  children,
  onOnboardingFinish,
}: Partial<OnboardingProps>) {
  useDevTokenInputSecretCode()

  const theme = useTheme()
  const { section, setSection } = useSection(active)
  const navigate = useNavigate()
  const { fresh: isOnboarding } = useOnboarded()
  const { reset } = useContextStorage()

  useEffect(() => {
    if (
      onOnboardingFinish &&
      section?.state === CreateCloudShellSectionState.Finished
    )
      onOnboardingFinish()
  }, [onOnboardingFinish, section?.state])

  return (
    <Flex
      width="100%"
      height="100%"
      direction="column"
      alignItems="center"
      overflowY="auto"
    >
      {isOnboarding && (
        <OnboardingHeader
          onRestart={() => {
            reset()
            navigate(0)
          }}
        />
      )}
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
          {!children && (
            <OnboardingFlow
              onNext={() => setSection(section.next || section)}
              onBack={() => setSection(section.prev || section)}
            />
          )}

          {children && children}
        </ResponsiveLayoutContentContainer>
        <ResponsiveLayoutSpacer />
      </Flex>
    </Flex>
  )
}

interface OnboardingProps {
  active?: Section
  children?: ReactElement | Array<ReactElement>
  onOnboardingFinish?: Dispatch<void>
}

function OnboardingWithContext({ ...props }: OnboardingProps): ReactElement {
  const { restoredContext, reset } = useContextStorage()

  const [scm, setSCM] = useState<SCMProps>(restoredContext?.scm ?? {})
  const [valid, setValid] = useState<boolean>(restoredContext?.valid ?? true)
  const [cloud, setCloud] = useState<CloudProps>(restoredContext?.cloud ?? {})
  const [sections, setSections] = useState<Sections>(defaultSections())
  const [section, setSection] = useState<Section>(
    sections[SectionKey.ONBOARDING_OVERVIEW]!
  )
  const [workspace, setWorkspace] = useState<WorkspaceProps>(
    restoredContext?.workspace ?? {}
  )

  // This is to make sure there is only a one-time state restore after oauth callback.
  // We should not store any sensitive data in the local storage longer than required.
  if (!IsEmpty(restoredContext)) reset()

  const context = useMemo<ContextProps>(
    () => ({
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
    }),
    [scm, cloud, valid, sections, section, workspace]
  )

  return (
    <OnboardingContext.Provider value={context}>
      <Onboarding
        active={restoredContext?.section}
        {...props}
      />
    </OnboardingContext.Provider>
  )
}

export { OnboardingWithContext as Onboarding }
