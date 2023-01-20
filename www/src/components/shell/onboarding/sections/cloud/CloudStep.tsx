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

function CloudStep({ onBack, onNext }) {
  const cloudType = useCloudType()
  const setPath = usePath(cloudType)
  const { valid } = useContext(OnboardingContext)
  const [showConfig, setShowConfig] = useState(false)
  const [expanded, setExpanded] = useState(false)
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
            buttonProps={{ children: 'Learn more' }}
            expandable
            expanded={expanded}
            onExpand={setExpanded}
          >
            Connecting with your cloud credentials allows us to lorem ipsum dolor.
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
