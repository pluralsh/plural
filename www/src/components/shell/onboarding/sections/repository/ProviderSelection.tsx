import { Div, Flex, Text } from 'honorable'
import { useState } from 'react'
import {
  Button,
  Callout,
  GitHubLogoIcon,
  GitLabLogoIcon,
} from '@pluralsh/design-system'

import { useNavigate } from 'react-router-dom'

import { useDevToken } from '../../../hooks/useDevToken'
import OnboardingCardButton from '../../OnboardingCardButton'
import useOnboarded from '../../../hooks/useOnboarded'

const providerToLogo = {
  github: <GitHubLogoIcon size={40} />,
  gitlab: <GitLabLogoIcon
    size={40}
    fullColor
  />,
}

const providerToDisplayName = {
  github: 'GitHub',
  gitlab: 'GitLab',
}

function ProviderSelection({ data }) {
  const devToken = useDevToken()
  const navigate = useNavigate()
  const { fresh: isOnboarding, mutation } = useOnboarded()
  const [expanded, setExpanded] = useState(false)

  return (
    <Flex
      direction="column"
      gap="xlarge"
    >
      <Flex gap="large">
        {data?.scmAuthorization?.map(({ provider, url }) => (
          <OnboardingCardButton
            key={provider}
            onClick={() => {
              // HACK to navigate the onboarding on staging environments
              if (import.meta.env.MODE !== 'production' && devToken) {
                (window as Window).location = `/oauth/callback/${provider.toLowerCase()}/shell?code=abcd`

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
                Create a {providerToDisplayName[provider.toLowerCase()] || null} repository
              </Text>
            </Flex>
          </OnboardingCardButton>
        ))}
      </Flex>

      <Callout
        severity="info"
        title="Why do I need to authenticate with GitHub/GitLab"
        expandable
        expanded={expanded}
        onExpand={setExpanded}
      >
        Plural manages all cluster configurations via Git, and will provision a Github repository on your behalf. This repository is set up using scoped deploy keys to store the state of your workspace, and no oauth credentials are persisted.
      </Callout>

      {isOnboarding && (
        <Flex
          gap="medium"
          justify="space-between"
          borderTop="1px solid border"
          paddingTop="large"
        >
          <Button
            secondary
            onClick={() => {
              mutation()
              navigate('/marketplace')
            }}
          >Skip onboarding
          </Button>
        </Flex>
      )}
    </Flex>
  )
}

export { ProviderSelection }
