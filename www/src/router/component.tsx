import { History as BrowserHistory, Location } from 'history'
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import { Router } from 'react-router-dom'

import { HistoryContext, PluralHistory } from './context'

function HistoryRouter({ history, children, ...props }: {history: BrowserHistory, children: JSX.Element[]}) {
  const [state, setState] = useState({
    action: history.action,
    location: history.location,
  })
  const pluralHistory = useMemo(() => new PluralHistory(), [])
  const pathBuilder = useCallback((location: Location) => `${location?.pathname}${location?.search}`, [])
  const setStateWrapper = useCallback(state => {
    pluralHistory.push(pathBuilder(state?.location))
    setState(state)
  }, [pluralHistory, pathBuilder])

  useLayoutEffect(() => history.listen(state => setStateWrapper(state)))

  // The initial state
  pluralHistory.push(pathBuilder(state?.location))

  return (
    <Router
      {...props}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    >
      <HistoryContext.Provider value={pluralHistory}>{children}</HistoryContext.Provider>
    </Router>

  )
}

export { HistoryRouter }

