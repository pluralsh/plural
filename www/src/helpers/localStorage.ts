import {
  CONSOLE_LOCAL_STORAGE_KEY,
  ONBOARDING_CHECKLIST_STATE,
  PROVIDER_LOCAL_STORAGE_KEY,
  SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY,
  SHOULD_USE_ONBOARDING_TERMINAL_SIDEBAR_LOCAL_STORAGE_KEY,
  STACK_NAME_LOCAL_STORAGE_KEY,
} from '../components/shell/constants'
import { isOnboardingChecklistHidden, setOnboardingChecklistState } from '../components/shell/persistance'
import { AUTH_PREVIOUS_USER_DATA } from '../constants'
import { BROWSER_HISTORY_STORAGE_KEY } from '../router/context'

import { wipeToken } from './authentication'

// Clears the user related local storage keys during logout.
function clearLocalStorage(): void {
  wipeToken()
  localStorage.removeItem(SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY)
  localStorage.removeItem(PROVIDER_LOCAL_STORAGE_KEY)
  localStorage.removeItem(STACK_NAME_LOCAL_STORAGE_KEY)
  localStorage.removeItem(CONSOLE_LOCAL_STORAGE_KEY)
  localStorage.removeItem(SHOULD_USE_ONBOARDING_TERMINAL_SIDEBAR_LOCAL_STORAGE_KEY)
  localStorage.removeItem(AUTH_PREVIOUS_USER_DATA)
  localStorage.removeItem(BROWSER_HISTORY_STORAGE_KEY)

  if (isOnboardingChecklistHidden()) {
    setOnboardingChecklistState(ONBOARDING_CHECKLIST_STATE.REAPPEAR)
  }
}

export { clearLocalStorage }
