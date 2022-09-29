import { Link } from 'react-router-dom'
import {
  Div,
  Flex,
  P,
  Text,
} from 'honorable'
import { Button } from 'pluralsh-design-system'
import { useQuery } from '@apollo/client'

import { AUTHENTICATION_URLS_QUERY } from '../../queries'

import DEBUG_SCM_TOKENS from '../debug-tokens'

import OnboardingCard from '../OnboardingCard'
import OnboardingCardButton from '../OnboardingCardButton'
import { Github as GithubLogo, Gitlab as GitlabLogo } from '../icons'
import useOnboardingNavigation from '../useOnboardingNavigation'

const providerToLogo = {
  github: <GithubLogo />,
  gitlab: <GitlabLogo />,
}

const providerToDisplayName = {
  github: 'GitHub',
  gitlab: 'GitLab',
}

function CreateRepositoryCard() {
  const { data } = useQuery(AUTHENTICATION_URLS_QUERY)
  const { previousTo } = useOnboardingNavigation()

  return (
    <>
      <OnboardingCard title="Create a repository">
        <P marginBottom="medium">
          We use GitOps to manage your application's state. Use one of the following providers to get started.
        </P>
        <Flex mx={-1}>
          {data?.scmAuthorization?.map(({ provider, url }) => (
            <OnboardingCardButton
              key={provider}
              onClick={() => {
                // Dev only
                if (process.env.NODE_ENV !== 'production' && DEBUG_SCM_TOKENS[provider]) {
                  console.log('going to ', `/oauth/callback/${provider.toLowerCase()}/shell?code=abcd`)
                  window.location = `/oauth/callback/${provider.toLowerCase()}/shell?code=abcd` as (string & Location)

                  return
                }

                // Production
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
      <Flex marginTop="large">
        <Button
          secondary
          as={Link}
          to={previousTo}
        >
          Back
        </Button>
      </Flex>
    </>
  )
}

export default CreateRepositoryCard
