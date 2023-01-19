import { Div, Flex, Text } from 'honorable'

import { useState } from 'react'

import { Button, Callout } from '@pluralsh/design-system'

import { Github as GithubLogo, Gitlab as GitlabLogo } from '../../../icons'
import { useDevToken } from '../../../hooks/useDevToken'
import OnboardingCardButton from '../../OnboardingCardButton'

const providerToLogo = {
  github: <GithubLogo width={40} />,
  gitlab: <GitlabLogo width={40} />,
}

const providerToDisplayName = {
  github: 'GitHub',
  gitlab: 'GitLab',
}

function ProviderSelection({ data }) {
  const devToken = useDevToken()
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
        buttonProps={{ children: 'Learn more' }}
        expandable
        expanded={expanded}
        onExpand={setExpanded}
      >
        We manage your cluster's state using Git, lorem ipsum dolor ist amet consectutor.
      </Callout>

      <Flex
        gap="medium"
        justify="space-between"
        borderTop="1px solid border"
        paddingTop="large"
      >
        <Button secondary>Skip onboarding</Button>
      </Flex>
    </Flex>
  )
}

export { ProviderSelection }
