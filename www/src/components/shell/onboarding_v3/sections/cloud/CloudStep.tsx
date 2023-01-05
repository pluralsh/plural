import { Flex } from 'honorable'
import { Button, Callout } from '@pluralsh/design-system'
import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useCloud, usePath } from '../../context/hooks'
import { CloudType, OnboardingPath } from '../../context/types'
import { OnboardingContext } from '../../context/onboarding'

import { ProviderSelection } from './ProviderSelection'
import CloudCredentials from './CloudCredentials'

function CloudStep({ onBack, onNext }) {
  const cloud = useCloud()
  const setCloudShellPath = usePath(OnboardingPath.CloudShell)
  const setLocalCLIPath = usePath(OnboardingPath.LocalCLI)
  const { valid } = useContext(OnboardingContext)
  const [showConfig, setShowConfig] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const hasConfig = useMemo(() => cloud === CloudType.Cloud, [cloud])

  useEffect(() => {
    if (cloud !== CloudType.Local) {
      setCloudShellPath()

      return
    }

    setLocalCLIPath()
  }, [cloud, setCloudShellPath, setLocalCLIPath])

  return (
    <Flex
      direction="column"
      gap="xlarge"
    >
      {!showConfig && (
        <ProviderSelection
          onBack={onBack}
          onNext={onNext}
        />
      )}

      {hasConfig && showConfig && (
        <CloudCredentials />
      )}

      <Callout
        severity="info"
        title="Why do I need to enter my cloud credentials?"
        buttonProps={{ children: 'Learn more' }}
        expandable
        expanded={expanded}
        onExpand={setExpanded}
      >
        Connecting with your cloud credentials allows us to lorem ipsum dolor.
      </Callout>

      <Flex
        gap="medium"
        justify="space-between"
        borderTop="1px solid border"
        paddingTop="large"
      >
        <Button
          secondary
          onClick={() => (hasConfig && showConfig ? setShowConfig(false) : onBack())}
        >Back
        </Button>
        <Button
          onClick={() => (hasConfig && !showConfig ? setShowConfig(true) : onNext())}
          disabled={!valid}
        >Continue
        </Button>
      </Flex>
    </Flex>
  )
}

export default CloudStep
