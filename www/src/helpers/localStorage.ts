import {
  CONSOLE_LOCAL_STORAGE_KEY, PROVIDER_LOCAL_STORAGE_KEY, SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY, SHOULD_USE_ONBOARDING_TERMINAL_SIDEBAR_LOCAL_STORAGE_KEY, STACK_NAME_LOCAL_STORAGE_KEY,
} from '../components/shell/constants'
import { AUTH_PREVIOUS_USER_DATA } from '../constants'
import { BROWSER_HISTORY_STORAGE_KEY } from '../router/context'

import { wipeToken } from './authentication'

// Clears the user related local storage keys.
function clearLocalStorage(): void {
  wipeToken()
  localStorage.removeItem(SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY)
  localStorage.removeItem(PROVIDER_LOCAL_STORAGE_KEY)
  localStorage.removeItem(STACK_NAME_LOCAL_STORAGE_KEY)
  localStorage.removeItem(CONSOLE_LOCAL_STORAGE_KEY)
  localStorage.removeItem(SHOULD_USE_ONBOARDING_TERMINAL_SIDEBAR_LOCAL_STORAGE_KEY)
  localStorage.removeItem(AUTH_PREVIOUS_USER_DATA)
  localStorage.removeItem(BROWSER_HISTORY_STORAGE_KEY)
}

export { clearLocalStorage }
