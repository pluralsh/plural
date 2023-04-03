/* eslint "@typescript-eslint/no-duplicate-enum-values":error */

export enum LocalStorageKeys {
  AuthToken = 'auth-token',
  OnboardingChecklist = 'onboarding-checklist',
  LegacyExpirationNotice = 'legacy-expiration-notice',
  DelinquencyNotice = 'delinquency-notice',
  AuthPreviousUserData = 'auth-previous-user-data',
  BrowserHistory = 'browser-history',
  BillingMigrationModalOpen = 'billing-migration-modal-open',
}

export const INTERCOM_APP_ID = 'p127zb9y' as const
