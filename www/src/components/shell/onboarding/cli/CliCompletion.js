import { useContext } from 'react'
import { P } from 'honorable'
import { ArrowTopRightIcon, Button } from 'pluralsh-design-system'
import { Link } from 'react-router-dom'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import OnboardingNavSection from '../OnboardingNavSection'

import OnboardingCard from '../OnboardingCard'

function CliCompletion() {
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
          endIcon={<ArrowTopRightIcon />}
        >
          Read the documentation
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
          as={Link}
          to="/marketplace"
        >
          Continue to app
        </Button>
      </OnboardingNavSection>
    </>
  )
}

export default CliCompletion
