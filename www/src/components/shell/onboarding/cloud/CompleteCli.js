import { useContext } from 'react'
import { Flex, P } from 'honorable'
import { ArrowTopRightIcon, Button } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import OnboardingNavSection from '../OnboardingNavSection'

import OnboardingCard from '../OnboardingCard'

function CompleteCli() {
  const { previous, next } = useContext(CreateShellContext)

  return (
    <>
      <OnboardingCard title="Get started">
        <P body1>
          Now that you've installed the Plural CLI, the power is in your hands.
          <br />
          Feel free to dive right into the docs to learn how to deploy on your own cloud.
        </P>
        <Button
          primary
          large
          width="100%"
          marginTop="medium"
          as="a"
          href="https://docs.plural.sh"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Flex align="center">
            Read the documentation
            <ArrowTopRightIcon
              size={24}
              marginLeft="small"
            />
          </Flex>
        </Button>
      </OnboardingCard>
      <OnboardingNavSection>
        <Button
          secondary
          onClick={() => previous()}
        >
          Back
        </Button>
        <Button
          primary
          onClick={() => next()}
        >
          Complete Setup
        </Button>
      </OnboardingNavSection>
    </>
  )
}

export default CompleteCli
