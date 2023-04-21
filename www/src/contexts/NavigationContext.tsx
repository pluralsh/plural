import { Link as ReactRouterLink, useLocation, useNavigate } from 'react-router-dom'
import { type NavigationContextLinkProps, NavigationContextProvider } from '@pluralsh/design-system'
import { ReactNode, Ref, forwardRef } from 'react'

function LinkRef({ href, ...props }: NavigationContextLinkProps, ref:Ref<any>) {
  return (
    <ReactRouterLink
      ref={ref}
      to={href ?? ''}
      {...props}
    />
  )
}
const Link = forwardRef(LinkRef)

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
