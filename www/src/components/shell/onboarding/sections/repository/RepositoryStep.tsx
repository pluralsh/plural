import { Flex } from 'honorable'
import { useMemo } from 'react'

import { useSCM } from '../../context/hooks'

import { ProviderSelection } from './ProviderSelection'
import { ProviderConfiguration } from './ProviderConfiguration'

function RepositoryStep({ onNext, data }) {
  const scm = useSCM()
  const isAuthenticated = useMemo(() => !!(scm.token && scm.provider && scm.authUrls?.length > 0), [scm])

  return (
    <Flex
      direction="column"
      gap="xlarge"
    >
      {!isAuthenticated && <ProviderSelection data={data} />}
      {isAuthenticated && <ProviderConfiguration onNext={onNext} />}
    </Flex>
  )
}

export default RepositoryStep
