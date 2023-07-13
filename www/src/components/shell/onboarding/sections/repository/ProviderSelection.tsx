import {
  Button,
  Callout,
  GitHubLogoIcon,
  GitLabLogoIcon,
} from '@pluralsh/design-system'
import { Div, Flex, Text } from 'honorable'
import { useCallback, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ImpersonationContext } from '../../../context/impersonation'
import { useDevToken } from '../../../hooks/useDevToken'
import useOnboarded from '../../../hooks/useOnboarded'
import { useContextStorage, useSectionState } from '../../context/hooks'
import { OnboardingContext } from '../../context/onboarding'
import { ConfigureCloudSectionState } from '../../context/types'
import OnboardingCardButton from '../../OnboardingCardButton'

const providerToLogo = {
  github: <GitHubLogoIcon size={40} />,
  gitlab: (
    <GitLabLogoIcon
      size={40}
      fullColor
    />
  ),
}

const providerToDisplayName = {
  github: 'GitHub',
  gitlab: 'GitLab',
}

function ProviderSelection({ data }) {
  const devToken = useDevToken()
  const navigate = useNavigate()
  const { fresh: isOnboarding, mutation } = useOnboarded()
  const setSectionState = useSectionState()
  const context = useContext(OnboardingContext)
  const {
    user: { id: userId },
    skip,
  } = useContext(ImpersonationContext)
  const { save } = useContextStorage()
  const [expanded, setExpanded] = useState(false)

  const isSelected = useMemo(
    () => !!context?.scm?.provider,
    [context?.scm?.provider]
  )

  const onBack = useCallback(
    () => setSectionState(ConfigureCloudSectionState.CloudSelection),
    [setSectionState]
  )
  const onNext = useCallback(
    () => setSectionState(ConfigureCloudSectionState.RepositoryConfiguration),
    [setSectionState]
  )

  return (
    <Flex
      direction="column"
      gap="xlarge"
    >
      <Flex gap="large">
        {data?.scmAuthorization?.map(({ provider, url }) => (
          <OnboardingCardButton
            data-phid={`oauth-${provider.toLowerCase()}`}
            key={provider}
            selected={context?.scm?.provider === provider}
            onClick={() => {
              save(
                {
                  ...context,
                  section: {
                    ...context?.section,
                    state: ConfigureCloudSectionState.RepositoryConfiguration,
                  },
                },
                !skip ? { userId } : undefined
              )

              // HACK to navigate the onboarding on staging environments
              if (import.meta.env.MODE !== 'production' && devToken) {
                ;(
                  window as Window
                ).location = `/oauth/callback/${provider.toLowerCase()}/shell?code=abcd`

                return
              }

              window.location = url
            }}
          >
            <Flex direction="column">
              <Div
                marginHorizontal="auto"
                maxWidth={40}
                maxHeight={40}
              >
                {providerToLogo[provider.toLowerCase()] || null}
              </Div>
              <Text
                body1
                bold
                marginTop="medium"
              >
                Create a {providerToDisplayName[provider.toLowerCase()] || null}{' '}
                repository
              </Text>
            </Flex>
          </OnboardingCardButton>
        ))}
      </Flex>

      <div data-phid="git-callout">
        <Callout
          severity="info"
          title="Why do I need to authenticate with GitHub/GitLab"
          expandable
          expanded={expanded}
          onExpand={setExpanded}
        >
          Plural manages all cluster configurations via Git, and will provision
          a GitHub repository on your behalf. This repository is set up using
          scoped deploy keys to store the state of your workspace, and no oauth
          credentials are persisted.
        </Callout>
      </div>

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
          >
            Skip onboarding
          </Button>
        )}
        <Flex
          grow={isOnboarding ? 0 : 1}
          gap="medium"
          justify="space-between"
        >
          <Button
            data-ph-id="back-from-repo-select"
            secondary
            onClick={() => onBack()}
          >
            Back
          </Button>
          <Button
            data-ph-id="cont-from-repo-select"
            disabled={!isSelected}
            onClick={() => onNext()}
          >
            Continue
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}

export { ProviderSelection }
