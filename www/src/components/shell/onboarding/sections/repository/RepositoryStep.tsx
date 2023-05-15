import { Flex } from 'honorable'
import { useContext, useMemo } from 'react'

import { ConfigureCloudSectionState } from '../../context/types'
import { OnboardingContext } from '../../context/onboarding'

import { ProviderSelection } from './ProviderSelection'
import { ProviderConfiguration } from './ProviderConfiguration'

function RepositoryStep({ data }) {
  const { section } = useContext(OnboardingContext)
  const state: ConfigureCloudSectionState = useMemo(
    () =>
      (section?.state as ConfigureCloudSectionState) ??
      ConfigureCloudSectionState.RepositorySelection,
    [section?.state]
  )

  return (
    <Flex
      direction="column"
      gap="xlarge"
    >
      {state === ConfigureCloudSectionState.RepositorySelection && (
        <ProviderSelection data={data} />
      )}
      {state === ConfigureCloudSectionState.RepositoryConfiguration && (
        <ProviderConfiguration />
      )}
    </Flex>
  )
}

export default RepositoryStep
