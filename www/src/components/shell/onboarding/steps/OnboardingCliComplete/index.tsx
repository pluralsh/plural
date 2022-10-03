import { Link } from 'react-router-dom'
import { P } from 'honorable'
import { ArrowTopRightIcon, Button } from 'pluralsh-design-system'

import { SECTION_CLI_COMPLETION } from '../../../constants'

import OnboardingCard from '../../OnboardingCard'
import OnboardingNavSection from '../../OnboardingNavSection'
import useOnboardingNavigation from '../../useOnboardingNavigation'

function OnboardingCliCompletion() {
  const { previousTo, nextTo } = useOnboardingNavigation(SECTION_CLI_COMPLETION)

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
          as={Link}
          to={previousTo}
        >
          Back
        </Button>
        <Button
          primary
          as={Link}
          to={nextTo}
        >
          Complete Setup
        </Button>
      </OnboardingNavSection>
    </>
  )
}

export default OnboardingCliCompletion
