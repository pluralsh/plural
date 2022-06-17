import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Div, Flex, P, Text } from 'honorable'

import { AUTHENTICATION_URLS_QUERY, CLOUD_SHELL_QUERY, REBOOT_SHELL_MUTATION } from './query'
import { Terminal } from './Terminal'
import { Github as GithubLogo, Gitlab as GitlabLogo } from './icons'
import { DEBUG_SCM_TOKENS } from './debug-tokens'

import OnboardingWrapper from './onboarding/OnboardingWrapper'
import OnboardingCard from './onboarding/OnboardingCard'
import OnboardingCardButton from './onboarding/OnboardingCardButton'

const providerToLogo = {
  github: <GithubLogo />,
  gitlab: <GitlabLogo />,
}

const providerToDisplayName = {
  github: 'GitHub',
  gitlab: 'GitLab',
}

function CreateRepositoryCard({ data }) {
  return (
    <OnboardingCard title="Create a repository">
      <P
        body1
        color="text-light"
        marginBottom="medium"
      >
        We use GitOps to manage your application's state. Use one of the following providers to get started.
      </P>
      <Flex mx={-1}>
        {data?.scmAuthorization?.map(({ provider, url }) => (
          <OnboardingCardButton
            key={provider}
            onClick={() => {
              // START <<Remove this after dev>>
              if (process.env.NODE_ENV !== 'production' && DEBUG_SCM_TOKENS[provider]) {
                console.log('going to ', `/oauth/callback/${provider.toLowerCase()}/shell?code=abcd`)
                window.location = `/oauth/callback/${provider.toLowerCase()}/shell?code=abcd`

                return
              }
              // END <<Remove this after dev>>

              window.location = url
            }}
          >
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
          </OnboardingCardButton>
        ))}
      </Flex>
    </OnboardingCard>
  )
}

function CloudShell() {
  const { data } = useQuery(AUTHENTICATION_URLS_QUERY)
  const { data: shellData } = useQuery(CLOUD_SHELL_QUERY, { fetchPolicy: 'cache-and-network' })
  const [rebootMutation] = useMutation(REBOOT_SHELL_MUTATION)
  const [created, setCreated] = useState(false)

  useEffect(() => {
    if (shellData && shellData.shell && !shellData.shell.alive) {
      rebootMutation()
      setCreated(true)
    }
  }, [shellData, rebootMutation])

  const ready = useMemo(
    () => (shellData && data),
    [shellData, data]
  )

  if ((shellData && shellData.shell) || created) {
    return (
      <Terminal />
    )
  }

  return (
    <OnboardingWrapper
      showSplashScreen
      stepIndex={0}
      childIsReady={ready}
    >
      <CreateRepositoryCard data={data} />
    </OnboardingWrapper>
  )
}

export default CloudShell
