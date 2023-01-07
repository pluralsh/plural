import { useQuery } from '@apollo/client'
import { LoopingLogo } from '@pluralsh/design-system'
import { Flex } from 'honorable'

import { AUTHENTICATION_URLS_QUERY } from '../queries'
import { useDevTokenOutputSecretCode } from '../useDevToken'

import OnboardingCard from './OnboardingCard'
import RepositoryStep from './sections/repository/RepositoryStep'
import CloudStep from './sections/cloud/CloudStep'
import WorkspaceStep from './sections/workspace/WorkspaceStep'
import SummaryStep from './sections/summary/SummaryStep'
import { useSection, useToken } from './context/hooks'
import CLIInstallationStep from './sections/cli/CLIInstallationStep'
import CLICompletionStep from './sections/cli/CLICompletionStep'
import { SectionKey } from './context/types'

function OnboardingFlow({
  onNext, onBack,
}) {
  const token = useToken() || ''
  const section = useSection()
  const { data, loading } = useQuery(AUTHENTICATION_URLS_QUERY)

  useDevTokenOutputSecretCode(token)

  if (loading) {
    return (
      <Flex
        align="center"
        justify="center"
      ><LoopingLogo />
      </Flex>
    )
  }

  return (
    <OnboardingCard title={section.title}>
      {section?.key === SectionKey.CREATE_REPOSITORY && (
        <RepositoryStep
          data={data}
          onNext={onNext}
        />
      )}
      {section?.key === SectionKey.CONFIGURE_CLOUD && (
        <CloudStep
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
        <SummaryStep onBack={onBack} />
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
  )
}

export { OnboardingFlow }
