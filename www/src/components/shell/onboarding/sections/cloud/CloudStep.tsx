import { Flex } from 'honorable'
import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Button, Callout } from '@pluralsh/design-system'

import { useCloudType, usePath } from '../../context/hooks'
import { CloudType } from '../../context/types'
import { OnboardingContext } from '../../context/onboarding'

import { ProviderSelection } from './ProviderSelection'
import CloudCredentials from './CloudCredentials'

enum CalloutKey {
  CloudCredentials,
  CloudCost,
}

function CloudStep({ onBack, onNext }) {
  const cloudType = useCloudType()
  const setPath = usePath(cloudType)
  const { valid } = useContext(OnboardingContext)
  const [showConfig, setShowConfig] = useState(false)
  const [expanded, setExpanded] = useState<CalloutKey | undefined>()
  const hasConfig = useMemo(() => cloudType === CloudType.Cloud, [cloudType])

  useEffect(() => setPath(), [cloudType, setPath])

  return (
    <Flex
      direction="column"
      gap="xlarge"
    >
      {!showConfig && (<ProviderSelection />)}

      {hasConfig && showConfig && (
        <>
          <CloudCredentials />
          <Callout
            severity="info"
            title="Why do I need to enter my cloud credentials?"
            expandable
            expanded={expanded === CalloutKey.CloudCredentials}
            onExpand={expanded => setExpanded(expanded ? CalloutKey.CloudCredentials : undefined)}
          >
            Plural uses your cloud credentials to create your infrastructure in your own cloud. All cloud credentials are stored securely using symmetric encryption.
          </Callout>

          <Callout
            severity="info"
            title="How much cloud cost should I expect?"
            expandable
            expanded={expanded === CalloutKey.CloudCost}
            onExpand={expanded => setExpanded(expanded ? CalloutKey.CloudCost : undefined)}
          >
            Lorem ipsum dolor...
          </Callout>
        </>
      )}

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
