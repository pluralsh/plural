import { Link as ReactRouterLink, useLocation, useNavigate } from 'react-router-dom'
import { type LinkProps, NavigationContextProvider } from '@pluralsh/design-system'
import { ReactNode } from 'react'

function Link({ href, ...props }: LinkProps) {
  return (
    <ReactRouterLink
      to={href ?? ''}
      {...props}
    />
  )
}

function usePathname() {
  const loc = useLocation()

  return loc.pathname
}

export default function AppNavContextProvider({
  children,
}: {
  children: ReactNode
}) {
  return (
    <NavigationContextProvider
      value={{
        Link,
        usePathname,
        useNavigate: () => {
          const navigate = useNavigate()

          return loc => {
            navigate(loc ?? '')
          }
        },
      }}
    >
      {children}
    </NavigationContextProvider>
  )
}
