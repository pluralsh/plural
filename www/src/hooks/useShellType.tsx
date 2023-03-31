import { useGetShellQuery } from '../generated/graphql'
import { useCurrentUser } from '../contexts/CurrentUserContext'

export function useShellType(): {
  type: 'cli' | 'cloud' | 'unknown'
  loading: boolean
  } {
  const { data, loading } = useGetShellQuery({
    fetchPolicy: 'cache-first',
  })
  const { hasInstallations } = useCurrentUser()
  const hasCloudShell = !!data?.shell

  const isCliUser = !hasCloudShell && hasInstallations
  const isCloudShellUser = hasCloudShell

  return {
    type: isCliUser ? 'cli' : isCloudShellUser ? 'cloud' : 'unknown',
    loading,
  }
}
