import { A, Flex } from 'honorable'
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
            Plural Cloud Shell uses your cloud credentials to create your infrastructure in your own cloud. Cloud credentials are stored securely using symmetric encryption. If you prefer, you can choose to use the Plural CLI which uses the cloud provider SDK on your local machine to connect to your cloud.
          </Callout>

          <Callout
            severity="info"
            title="How much cloud cost should I expect?"
            expandable
            expanded={expanded === CalloutKey.CloudCost}
            onExpand={expanded => setExpanded(expanded ? CalloutKey.CloudCost : undefined)}
            buttonProps={{
              children: 'Learn more',
              as: A,
              href: 'https://docs.plural.sh/operations/cost-management',
              target: '_blank',
              style: {
                textDecoration: 'none',
                color: 'inherit',
              },
            }}
          >
            By default Plural will deploy 3 nodes, each with 2 vCPU/8 GB along with Kubernetes. Costs are attributable to running the EKS/AKS/GKE cluster and 3 additional nodes, as well as any additional applications deployed.
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
