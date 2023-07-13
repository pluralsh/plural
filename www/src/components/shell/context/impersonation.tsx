import { ReactElement, createContext, useEffect, useState } from 'react'

import { User, useMeQuery } from '../../../generated/graphql'
import LoadingIndicator from '../../utils/LoadingIndicator'

interface ContextProps {
  user: User
  skip: boolean
}

const ImpersonationContext = createContext<ContextProps>({} as ContextProps)

function WithImpersonation({ skip, children }): ReactElement {
  const { data, loading } = useMeQuery({ fetchPolicy: 'network-only' })
  const [context, setContext] = useState<ContextProps>({} as ContextProps)

  useEffect(() => {
    if (data?.me) {
      setContext({ user: data.me as User, skip })
    }
  }, [data?.me, skip])

  if (!data?.me || loading) {
    return <LoadingIndicator />
  }

  return (
    <ImpersonationContext.Provider value={context}>
      {children}
    </ImpersonationContext.Provider>
  )
}

export type { ContextProps }
export { ImpersonationContext, WithImpersonation }
