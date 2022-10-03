import { State } from 'history'
import {
  createContext, useCallback, useContext, useLayoutEffect, useMemo, useState,
} from 'react'
import { Router, useNavigate } from 'react-router-dom'

const HistoryContext = createContext({} as History)

interface History {
  push(path: string): void
  pop(defaultPath: string): string
}

class PluralHistory implements History {
  private _stack: Array<State> = []

  // We do not want to store those paths in the history
  private readonly _filteredPaths: Array<string> = ['login']

  private readonly _localStorageKey = 'browser-history'

  // Keep only this number of entries in the history
  private readonly _maxHistoryLength = 20

  constructor() {
    this._restoreHistory()
  }

  pop(defaultPath: string): string {
    const path = this._stack.pop() || defaultPath

    localStorage.setItem(this._localStorageKey, JSON.stringify(this._stack))

    return path
  }

  push(path: string): void {
    if (this._isLastEqual(path) || this._isFiltered(path)) {
      return
    }

    this._push(path)
  }

  private _isLastEqual(path: string): boolean {
    return this._stack.at(this._stack.length - 1) === path
  }

  private _isFiltered(path: string): boolean {
    return this._filteredPaths.some(p => path.includes(p))
  }

  private _push(path: string): void {
    if (this._stack.length >= this._maxHistoryLength) {
      this._stack = this._stack.slice(this._stack.length - 1)
    }

    this._stack.push(path)
    localStorage.setItem(this._localStorageKey, JSON.stringify(this._stack))
  }

  private _restoreHistory(): void {
    const history = localStorage.getItem(this._localStorageKey)

    if (!history) {
      return
    }

    this._stack = JSON.parse(history) as Array<string>
  }
}

function HistoryRouter({ history, children, ...props }: {history: History, children: JSX.Element[]}) {
  const [state, setState] = useState({
    action: history.action,
    location: history.location,
  })
  const pluralHistory = useMemo(() => new PluralHistory(), [])
  const setStateWrapper = useCallback(state => {
    pluralHistory.push(state.location?.pathname)
    setState(state)

    console.log(pluralHistory)
  }, [pluralHistory])

  useLayoutEffect(() => history.listen(state => setStateWrapper(state), [history]))

  // The initial state
  pluralHistory.push(state.location?.pathname)

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

export function useHistory(): History {
  const ctx = useContext(HistoryContext)
  const navigate = useNavigate()

  return ctx
}

export default HistoryRouter

