import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'
import OnboardingNavSection from '../OnboardingNavSection'
import { Exceptions } from '../../validation'
import OnboardingCard from '../OnboardingCard'

import useOnboardingNavigation from '../../useOnboardingNavigation'

import { ScmInput } from './ScmInput'

export function OnboardingRepository() {
  const { exceptions, error, next } = useContext(CreateShellContext)
  const navigate = useNavigate()
  const { previousTo, nextTo } = useOnboardingNavigation()

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
