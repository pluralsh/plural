import { useQuery } from '@apollo/client'
import { Flex } from 'honorable'
import { useMemo } from 'react'
import { LoopingLogo } from '@pluralsh/design-system'

import { AUTHENTICATION_URLS_QUERY } from '../queries'
import { useDevTokenOutputSecretCode } from '../hooks/useDevToken'

import OnboardingCard from './OnboardingCard'
import CloudStep from './sections/cloud/CloudStep'
import WorkspaceStep from './sections/workspace/WorkspaceStep'
import { useSection, useToken } from './context/hooks'
import CLIInstallationStep from './sections/cli/CLIInstallationStep'
import CLICompletionStep from './sections/cli/CLICompletionStep'
import { CreateCloudShellSectionState, SectionKey } from './context/types'
import CreateShellStep from './sections/shell/CreateShellStep'
import OverviewStep from './sections/overview/OverviewStep'
import OnboardingTips from './OnboardingTips'

function OnboardingFlow({ onNext, onBack }) {
  const token = useToken() || ''
  const { section } = useSection()
  const isCreating = useMemo(
    () => section.state === CreateCloudShellSectionState.Creating,
    [section]
  )
  const { data, loading } = useQuery(AUTHENTICATION_URLS_QUERY)

  useDevTokenOutputSecretCode(token)

  if (loading) {
    return (
      <Flex
        align="center"
        justify="center"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  return (
    <Flex
      gap="large"
      direction="column"
    >
      <OnboardingCard
        title={isCreating ? '' : section.title}
        mode={isCreating ? 'Compact' : 'Default'}
      >
        {section?.key === SectionKey.ONBOARDING_OVERVIEW && (
          <OverviewStep onNext={onNext} />
        )}
        {section?.key === SectionKey.CONFIGURE_CLOUD && (
          <CloudStep
            data={data}
            onNext={onNext}
            onBack={onBack}
          />
        )}
        {section?.key === SectionKey.CONFIGURE_WORKSPACE && (
          <WorkspaceStep
            onNext={onNext}
            onBack={onBack}
          />
        )}
        {section?.key === SectionKey.CREATE_CLOUD_SHELL && (
          <CreateShellStep onBack={onBack} />
        )}
        {section?.key === SectionKey.INSTALL_CLI && (
          <CLIInstallationStep
            onNext={onNext}
            onBack={onBack}
          />
        )}
        {section?.key === SectionKey.COMPLETE_SETUP && (
          <CLICompletionStep onBack={onBack} />
        )}
      </OnboardingCard>
      {isCreating && !section.hasError && <OnboardingTips />}
    </Flex>
  )
}

export { OnboardingFlow }
