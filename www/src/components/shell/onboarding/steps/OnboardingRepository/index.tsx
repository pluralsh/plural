import { Link } from 'react-router-dom'
import { Button } from 'pluralsh-design-system'

import OnboardingNavSection from '../../OnboardingNavSection'
import OnboardingCard from '../../OnboardingCard'
import Exceptions from '../../Exceptions'

import useOnboardingNavigation from '../../useOnboardingNavigation'

import useValidation from '../../useValidation'

import { SECTION_REPOSITORY } from '../../../constants'

import { ScmInput } from './ScmInput'

function OnboardingRepository() {
  const { exceptions, error } = useValidation(SECTION_REPOSITORY)
  const { previousTo, nextTo } = useOnboardingNavigation(SECTION_REPOSITORY)

  return (
    <>
      <OnboardingCard>
        <ScmInput />
        {exceptions && (
          <Exceptions exceptions={exceptions} />
        )}
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
          disabled={error}
          as={Link}
          to={nextTo}
        >
          Continue
        </Button>
      </OnboardingNavSection>
    </>
  )
}

export default OnboardingRepository
