import {
  Link as ReactRouterLink,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { NavigationContextProvider } from '@pluralsh/design-system'
import { ComponentProps, ReactNode, useMemo } from 'react'

function Link({ href, ...props }: ComponentProps<'a'>) {
  return (
    <ReactRouterLink
      to={href ?? ''}
      {...props}
    />
  )
}

export default function AppNavContextProvider({
  children,
}: {
  children: ReactNode
}) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const value = useMemo(
    () => ({
      Link,
      pathname,
      navigate: (loc?: string) => navigate(loc ?? ''),
    }),
    [pathname, navigate]
  )

  return (
    <NavigationContextProvider value={value}>
      {children}
    </NavigationContextProvider>
  )
}
