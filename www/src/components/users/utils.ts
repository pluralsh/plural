import { GitHubLogoIcon, GitLabLogoIcon, GoogleLogoIcon } from '@pluralsh/design-system'

export const obscure = token => token.substring(0, 9) + 'x'.repeat(15)

const CHALLENGE_KEY = 'oauth-challenge'
const DEVICE_TOKEN_KEY = 'device-token'

export const saveChallenge = challenge => localStorage.setItem(CHALLENGE_KEY, challenge)
export const getChallenge = () => localStorage.getItem(CHALLENGE_KEY)
export const wipeChallenge = () => localStorage.removeItem(CHALLENGE_KEY)

export const saveDeviceToken = deviceToken => localStorage.setItem(DEVICE_TOKEN_KEY, deviceToken)
export const getDeviceToken = () => localStorage.getItem(DEVICE_TOKEN_KEY)
export const wipeDeviceToken = () => localStorage.removeItem(DEVICE_TOKEN_KEY)

export const METHOD_ICONS = {
  GOOGLE: GoogleLogoIcon,
  GITHUB: GitHubLogoIcon,
  GITLAB: GitLabLogoIcon,
}

