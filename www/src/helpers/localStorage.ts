import { AUTH_PREVIOUS_USER_DATA } from '../constants'
import { BROWSER_HISTORY_STORAGE_KEY } from '../router/context'

import { wipeToken } from './authentication'

export const ONBOARDING_CHECKLIST_LOCAL_STORAGE_KEY = 'onboarding-checklist'
export enum ONBOARDING_CHECKLIST_STATE {
  HIDDEN = 'HIDDEN',
  REAPPEAR = 'REAPPEAR',
}

// Clears the user related local storage keys during logout.
function clearLocalStorage(): void {
  wipeToken()
  localStorage.removeItem(AUTH_PREVIOUS_USER_DATA)
  localStorage.removeItem(BROWSER_HISTORY_STORAGE_KEY)

  if (isOnboardingChecklistHidden()) {
    setOnboardingChecklistState(ONBOARDING_CHECKLIST_STATE.REAPPEAR)
  }
}

export function isOnboardingChecklistHidden(): boolean {
  return localStorage.getItem(ONBOARDING_CHECKLIST_LOCAL_STORAGE_KEY) === ONBOARDING_CHECKLIST_STATE.HIDDEN
}

export function shouldOnboardingChecklistReappear(): boolean {
  return localStorage.getItem(ONBOARDING_CHECKLIST_LOCAL_STORAGE_KEY) === ONBOARDING_CHECKLIST_STATE.REAPPEAR
}

export function setOnboardingChecklistState(state: ONBOARDING_CHECKLIST_STATE): void {
  localStorage.setItem(ONBOARDING_CHECKLIST_LOCAL_STORAGE_KEY, state)
}

export function clearOnboardingChecklistState(): void {
  localStorage.removeItem(ONBOARDING_CHECKLIST_LOCAL_STORAGE_KEY)
}

export { clearLocalStorage }
