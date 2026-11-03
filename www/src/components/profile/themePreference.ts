import { setThemeColorMode, useThemeColorMode } from '@pluralsh/design-system'
import { useEffect, useLayoutEffect, useState } from 'react'

type ColorMode = 'dark' | 'light'

export type ThemePreference = ColorMode | 'system'

const PREFERENCE_KEY = 'plural-cloud-theme-preference'
const PREFERENCE_CHANGE_EVENT = 'plural-cloud-theme-preference-change'
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'
const TEXT_ENTRY_TAGS = ['INPUT', 'TEXTAREA', 'SELECT']

function systemColorMode(): ColorMode {
  if (!window.matchMedia) return 'dark'

  return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light'
}

function readThemePreference(): ThemePreference | null {
  const preference = localStorage.getItem(PREFERENCE_KEY)

  return preference === 'dark' ||
    preference === 'light' ||
    preference === 'system'
    ? preference
    : null
}

export function setThemePreference(preference: ThemePreference) {
  localStorage.setItem(PREFERENCE_KEY, preference)
  setThemeColorMode(preference === 'system' ? systemColorMode() : preference)
  window.dispatchEvent(new Event(PREFERENCE_CHANGE_EVENT))
}

export function useThemePreference() {
  const colorMode = useThemeColorMode()
  const [preference, setPreference] = useState(readThemePreference)

  useEffect(() => {
    const onChange = () => setPreference(readThemePreference())

    window.addEventListener(PREFERENCE_CHANGE_EVENT, onChange)
    window.addEventListener('storage', onChange)

    return () => {
      window.removeEventListener(PREFERENCE_CHANGE_EVENT, onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])

  return [
    preference ?? (colorMode === 'light' ? 'light' : 'dark'),
    setThemePreference,
  ] as const
}

// Mount once near the app root: follows the OS scheme while the preference is
// "system" and toggles dark/light on Shift+T outside of text fields.
export function useThemePreferenceSync() {
  const colorMode = useThemeColorMode()

  useLayoutEffect(() => {
    const media = window.matchMedia?.(DARK_SCHEME_QUERY)
    const sync = () => {
      if (readThemePreference() === 'system') {
        setThemeColorMode(systemColorMode())
      }
    }

    sync()
    media?.addEventListener('change', sync)

    return () => media?.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null

      if (
        !event.shiftKey ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.key.toLowerCase() !== 't' ||
        target?.isContentEditable ||
        TEXT_ENTRY_TAGS.includes(target?.tagName ?? '')
      ) {
        return
      }

      event.preventDefault()
      setThemePreference(colorMode === 'dark' ? 'light' : 'dark')
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [colorMode])
}
