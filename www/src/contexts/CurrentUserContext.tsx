import { ComponentProps, createContext } from 'react'

import { MeQuery } from '../generated/graphql'

export type CurrentUser = Exclude<MeQuery['me'], undefined | null>

const defaultUser = {
  id: '',
  name: '',
  email: '',
  account: { id: '' },
} as const satisfies CurrentUser

const CurrentUserContext = createContext<CurrentUser>(defaultUser)

export function CurrentUserContextProvider({
  value,
  ...props
}: {
  value?: CurrentUser | null
} & Omit<ComponentProps<typeof CurrentUserContext.Provider>, 'value'>) {
  return (
    <CurrentUserContext.Provider
      value={value || defaultUser}
      {...props}
    />
  )
}

export default CurrentUserContext
