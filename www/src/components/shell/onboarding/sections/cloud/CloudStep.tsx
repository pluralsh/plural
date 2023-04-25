import { A, Flex } from 'honorable'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Button, Callout } from '@pluralsh/design-system'
import { useNavigate } from 'react-router-dom'

import { useCloudType, usePath, useSectionState } from '../../context/hooks'
import { CloudType, ConfigureCloudSectionState } from '../../context/types'
import { OnboardingContext } from '../../context/onboarding'
import useOnboarded from '../../../hooks/useOnboarded'
import RepositoryStep from '../repository/RepositoryStep'

import { ProviderSelection } from './ProviderSelection'
import CloudCredentials from './CloudCredentials'

enum CalloutKey {
  CloudCredentials,
  CloudCost,
}

type StateOrder = {
  [key in ConfigureCloudSectionState]?: ConfigureCloudSectionState | undefined
}

const buildStateOrder = (path: CloudType): StateOrder => {
  switch (path) {
  case CloudType.Local:
    return { [ConfigureCloudSectionState.CloudSelection]: undefined }
  case CloudType.Demo:
    return { [ConfigureCloudSectionState.CloudSelection]: undefined }
  default:
    return {
      [ConfigureCloudSectionState.CloudSelection]: ConfigureCloudSectionState.RepositorySelection,
      [ConfigureCloudSectionState.RepositorySelection]: ConfigureCloudSectionState.RepositoryConfiguration,
      [ConfigureCloudSectionState.RepositoryConfiguration]: ConfigureCloudSectionState.CloudConfiguration,
      [ConfigureCloudSectionState.CloudConfiguration]: undefined,
    }
  }
}

const reverseLookup = (stateOrder: StateOrder, findByValue: ConfigureCloudSectionState): ConfigureCloudSectionState | undefined => {
  const [key] = Object.entries<ConfigureCloudSectionState>(stateOrder).find(([_, value]) => (value === findByValue ? true : undefined)) ?? []

  return key as ConfigureCloudSectionState
}

function CloudStep({ onBack, onNext, data }) {
  const cloudType = useCloudType()
  const setPath = usePath(cloudType)
  const navigate = useNavigate()
  const setSectionState = useSectionState()
  const { fresh: isOnboarding, mutation } = useOnboarded()
  const { valid, section } = useContext(OnboardingContext)

  const [expanded, setExpanded] = useState<CalloutKey | undefined>()

  const state: ConfigureCloudSectionState = useMemo(() => section?.state as ConfigureCloudSectionState ?? ConfigureCloudSectionState.CloudSelection, [section?.state])
  const stateOrder = useMemo(() => buildStateOrder(cloudType), [cloudType])
  const hasNext = useMemo(() => !!stateOrder[state], [state, stateOrder])
  const hasPrevious = useMemo(() => !!reverseLookup(stateOrder, state), [state, stateOrder])
  const isRepositoryStep = useMemo(() => state === ConfigureCloudSectionState.RepositoryConfiguration
    || state === ConfigureCloudSectionState.RepositorySelection,
  [state])

  const next = useCallback(() => setSectionState(stateOrder[state] ?? state), [setSectionState, state, stateOrder])
  const previous = useCallback(() => setSectionState(reverseLookup(stateOrder, state) ?? state), [setSectionState, state, stateOrder])

  useEffect(() => setPath(), [cloudType, setPath])

  return (
    <>
      {isRepositoryStep && <RepositoryStep data={data} />}

      {!isRepositoryStep && (
        <Flex
          direction="column"
          gap="xlarge"
        >
          {state === ConfigureCloudSectionState.CloudSelection && <ProviderSelection />}

          {state === ConfigureCloudSectionState.CloudConfiguration && (
            <>
              <CloudCredentials />
              <div data-phid="cloud-cred-callout">
                <Callout
                  severity="info"
                  title="Why do I need to enter my cloud credentials and how do I configure them?"
                  expandable
                  expanded={expanded === CalloutKey.CloudCredentials}
                  onExpand={expanded => setExpanded(expanded ? CalloutKey.CloudCredentials : undefined)}
                  buttonProps={{
                    'data-phid': 'cloud-cred-see-docs',
                    children: 'See the configuration docs',
                    as: A,
                    href: 'https://docs.plural.sh/getting-started/cloud-shell-quickstart#set-up-a-cloud-provider',
                    target: '_blank',
                    style: {
                      textDecoration: 'none',
                      color: 'inherit',
                    },
                  }}
                >
                  Plural Cloud Shell uses your cloud credentials to create your infrastructure in your own cloud. Cloud credentials are stored securely using symmetric encryption. If you prefer, you can choose to use the Plural CLI which uses the cloud provider SDK on your local machine to connect to your cloud.
                </Callout>
              </div>
              <div data-phid="cloud-cost-callout">
                <Callout
                  severity="info"
                  title="How much cloud cost should I expect?"
                  expandable
                  expanded={expanded === CalloutKey.CloudCost}
                  onExpand={expanded => setExpanded(expanded ? CalloutKey.CloudCost : undefined)}
                  buttonProps={{
                    'data-phid': 'cloud-cost-learn-more',
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
              </div>
            </>
          )}

          <Flex
            gap="medium"
            justify={isOnboarding ? 'space-between' : 'flex-end'}
            borderTop="1px solid border"
            paddingTop="large"
          >
            {isOnboarding && (
              <Button
                data-phid="skip-onboarding"
                secondary
                onClick={() => {
                  mutation()
                  navigate('/overview/clusters')
                }}
              >Skip onboarding
              </Button>
            )}

            <Flex
              grow={isOnboarding ? 0 : 1}
              gap="medium"
              justify="space-between"
            >
              <Button
                data-phid={
                  state === ConfigureCloudSectionState.CloudConfiguration
                    ? 'back-from-config-cloud'
                    : 'back-from-choose-shell'
                }
                secondary
                onClick={() => (hasPrevious ? previous() : onBack())}
              >Back
              </Button>
              <Button
                data-phid={
                  state === ConfigureCloudSectionState.CloudConfiguration
                    ? 'cont-from-config-cloud'
                    : 'cont-from-choose-shell'
                }
                onClick={() => (hasNext ? next() : onNext())}
                disabled={!valid}
              >Continue
              </Button>
            </Flex>
          </Flex>
        </Flex>
      )}
    </>
  )
}

export default CloudStep
