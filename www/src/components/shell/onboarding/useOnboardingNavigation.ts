import { useLocation } from 'react-router-dom'

import { urlPartToNextStep, urlPartToPreviousStep } from '../ShellRouter'

function useOnboardingNavigation() {
  const urlPart = useLocation().pathname.split('/').pop() || ''

  return {
    previousTo: urlPartToPreviousStep[urlPart] || '/shell/onboarding',
    nextTo: urlPartToNextStep[urlPart] || '/shell',
  }
}

export default useOnboardingNavigation
