import { useCallback } from 'react'

import {
  SECTION_TO_NEXT_SECTION,
  SECTION_TO_PREVIOUS_SECTION,
  SECTION_TO_URL,
} from '../ShellRouter'

function useOnboardingNavigation(section: string, ...args) {
  const useSection = useCallback(section => (typeof section === 'function' ? section(...args) : section) || '', [args])
  const previousSection = useSection(SECTION_TO_PREVIOUS_SECTION[section])
  const nextSection = useSection(SECTION_TO_NEXT_SECTION[section])

  return {
    previousTo: SECTION_TO_URL[previousSection] ? `/shell/onboarding/${SECTION_TO_URL[previousSection]}` : null,
    nextTo: SECTION_TO_URL[nextSection] ? `/shell/onboarding/${SECTION_TO_URL[nextSection]}` : null,
  }
}

export default useOnboardingNavigation
