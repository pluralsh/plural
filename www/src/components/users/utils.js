export const obscure = (token) => token.substring(0, 9) + "x".repeat(15)

const CHALLENGE_KEY = 'oauth-challenge'

export const saveChallenge = (challenge) => localStorage.setItem(CHALLENGE_KEY, challenge)
export const getChallenge = () => localStorage.getItem(CHALLENGE_KEY)
export const wipeChallenge = () => localStorage.removeItem(CHALLENGE_KEY)