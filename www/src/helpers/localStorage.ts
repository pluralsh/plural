import posthog from 'posthog-js'

import { LocalStorageKeys } from '../constants'

import { wipeToken } from './authentication'

export const ONBOARDING_CHECKLIST_LOCAL_STORAGE_KEY =
  LocalStorageKeys.OnboardingChecklist
export enum ONBOARDING_CHECKLIST_STATE {
  HIDDEN = 'HIDDEN',
  REAPPEAR = 'REAPPEAR',
}

export enum EXPIRATION_NOTICE_STATE {
  INITIAL = '',
  DISMISSED_0 = 'DISMISSED_0',
  DISMISSED_1 = 'DISMISSED_1',
  DISMISSED_2 = 'DISMISSED_2',
  DISMISSED_3 = 'DISMISSED_3',
}

// Clears the user related local storage keys during logout.
function clearLocalStorage(): void {
  wipeToken()
  posthog.reset()
  localStorage.removeItem(LocalStorageKeys.AuthPreviousUserData)
  localStorage.removeItem(LocalStorageKeys.BrowserHistory)
  localStorage.removeItem(LocalStorageKeys.LegacyExpirationNotice)

  if (isOnboardingChecklistHidden()) {
    setOnboardingChecklistState(ONBOARDING_CHECKLIST_STATE.REAPPEAR)
  }
}

export function isOnboardingChecklistHidden(): boolean {
  return (
    localStorage.getItem(LocalStorageKeys.OnboardingChecklist) ===
    ONBOARDING_CHECKLIST_STATE.HIDDEN
  )
}

export function shouldOnboardingChecklistReappear(): boolean {
  return (
    localStorage.getItem(LocalStorageKeys.OnboardingChecklist) ===
    ONBOARDING_CHECKLIST_STATE.REAPPEAR
  )
}

export function setOnboardingChecklistState(
  state: ONBOARDING_CHECKLIST_STATE
): void {
  localStorage.setItem(LocalStorageKeys.OnboardingChecklist, state)
}

export function clearOnboardingChecklistState(): void {
  localStorage.removeItem(LocalStorageKeys.OnboardingChecklist)
}

export { clearLocalStorage }
