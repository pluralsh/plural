import { useCallback } from 'react'
import useKeys from 'react-piano-keys'

export const DEV_TOKEN_LOCALSTORAGE_KEY = 'pluralsh-onboarding-provider-token'

// HACK to secretly read the github/gitlab token for user input to navigate the onboarding in staging environments
// The code to activate it is written bellow
export function useDevTokenInputSecretCode() {
  const handleTokenSecretCode = useCallback(() => {
    const token = window.prompt('Enter your GitHub/GitLab token')

    localStorage.setItem(DEV_TOKEN_LOCALSTORAGE_KEY, token ?? '')
  }, [])

  useKeys(window, 'left left left right right right i n', handleTokenSecretCode)
}

export function useDevTokenOutputSecretCode(token: string) {
  const handleTokenSecretCode = useCallback(() => {
    window.alert(`Here is your GitHub/GitLab token: ${token}`)
  }, [token])

  useKeys(window, 'left left left right right right o u t', handleTokenSecretCode)
}

export function useDevToken() {
  return localStorage.getItem(DEV_TOKEN_LOCALSTORAGE_KEY)
}
