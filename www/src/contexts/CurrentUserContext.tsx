import { ComponentProps, createContext } from 'react'

import { MeQuery } from '../generated/graphql'

type Me = Exclude<MeQuery['me'], undefined | null>

const defaultUser = {
  id: '',
  name: '',
  email: '',
  account: { id: '' },
} as const satisfies Me

const CurrentUserContext = createContext<Me>(defaultUser)

export function CurrentUserContextProvider({
  value,
  ...props
}: {
  value?: Me | null
} & Omit<ComponentProps<typeof CurrentUserContext.Provider>, 'value'>) {
  return (
    <CurrentUserContext.Provider
      value={value || defaultUser}
      {...props}
    />
  )
}

export default CurrentUserContext
