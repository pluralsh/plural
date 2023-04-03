import { useMemo } from 'react'

import { useCurrentUser } from '../contexts/CurrentUserContext'

export function useShellType() {
  const { hasInstallations, hasShell } = useCurrentUser()

  return useMemo(() => {
    const isCliUser = !hasShell && hasInstallations
    const isCloudShellUser = hasShell

    return isCliUser ? 'cli' : isCloudShellUser ? 'cloud' : 'unknown'
  }, [hasInstallations, hasShell])
}

export type ShellType = ReturnType<typeof useShellType>
