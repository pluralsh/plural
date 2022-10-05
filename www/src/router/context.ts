import { createContext } from 'react'

export const BROWSER_HISTORY_STORAGE_KEY = 'browser-history'

class PluralHistory {
  private _stack: Array<string> = []

  // We do not want to store those paths in the history
  private readonly _filteredPaths: Array<string> = ['/login', '/oauth', '/signup', '/sso']

  private readonly _localStorageKey = BROWSER_HISTORY_STORAGE_KEY

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
    return this._filteredPaths.some(p => path.endsWith(p) || path.startsWith(p)) || path === '/' // Filter out the root path also
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

const HistoryContext = createContext({} as PluralHistory)

export { PluralHistory, HistoryContext }
