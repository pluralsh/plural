import { ReactNode, createContext, useContext, useMemo } from 'react'
import { type ImmerReducer, useImmerReducer } from 'use-immer'

type DocPageState = {
  scrollHash: { value: string; timestamp: number }
  selectedHash: string
}

type DocPageContextT = DocPageState & {
  scrollToHash: (hash: string) => void
  setHash: (hash: string) => void
}

const defaultState: DocPageState = {
  scrollHash: { value: '', timestamp: 0 },
  selectedHash: '',
}

const DocPageContext = createContext<DocPageContextT | null>(null)

const reducer: ImmerReducer<
  DocPageState,
  | { type: 'scrollToHash'; payload: string }
  | { type: 'setHash'; payload: string }
> = (draft, action) => {
  switch (action.type) {
    case 'scrollToHash':
      draft.scrollHash = { value: action.payload, timestamp: Date.now() }
      draft.selectedHash = action.payload

      return draft
      break
    case 'setHash':
      draft.selectedHash = action.payload

      return draft
    default:
      console.error('Incorrect action type sent to docPageContextReducer')

      return draft
  }
}

export const useDocPageContext = () => {
  const context = useContext(DocPageContext)

  if (!context) {
    throw Error(
      'useDocPageContext() must be used within <DocPageContextProvider />'
    )
  }

  return context
}

export function DocPageContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useImmerReducer(reducer, defaultState)

  const contextVal = useMemo(
    () => ({
      ...state,
      scrollToHash: (hash: string) => {
        dispatch({ type: 'scrollToHash', payload: hash })
      },
      setHash: (hash: string) => {
        dispatch({ type: 'setHash', payload: hash })
      },
    }),
    [dispatch, state]
  )

  return (
    <DocPageContext.Provider value={contextVal}>
      {children}
    </DocPageContext.Provider>
  )
}
