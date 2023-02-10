import { createContext } from 'react'

import { User } from '../generated/graphql'

const CurrentUserContext = createContext<User>({
  id: '', name: '', email: '', account: { id: '' },
})

export default CurrentUserContext
