import {
  Div,
  Flex,
  P,
  Text,
} from 'honorable'
import { Button } from '@pluralsh/design-system'

import { Github as GithubLogo, Gitlab as GitlabLogo } from './icons'
import OnboardingCard from './onboarding/OnboardingCard'
import OnboardingCardButton from './onboarding/OnboardingCardButton'
import OnboardingNavSection from './onboarding/OnboardingNavSection'
import { useDevToken } from './useDevToken'

const providerToLogo = {
  github: <GithubLogo width={40} />,
  gitlab: <GitlabLogo width={40} />,
}

const providerToDisplayName = {
  github: 'GitHub',
  gitlab: 'GitLab',
}

function CreateRepositoryCard({ data, onPrevious = () => {} }: any) {
  const devToken = useDevToken()

  return (
    <OnboardingCard title="Create a repository">
      <P marginBottom="medium">
        We use GitOps to manage your application's state. Use one of the following providers to get started.
      </P>
      <Flex mx={-1}>
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
      <OnboardingNavSection>
        <Button
          secondary
          onClick={onPrevious}
        >
          Back
        </Button>
      </OnboardingNavSection>
    </OnboardingCard>
  )
}

export default CreateRepositoryCard
