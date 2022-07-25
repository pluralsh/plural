import { useCallback, useContext, useState } from 'react'

import * as serviceWorker from '../../serviceWorker'

import { PluralConfigurationContext } from '../login/CurrentUser'

const COMMIT_KEY = 'git-commit'

export const DEFAULT_COMMIT = 'plural-default-commit'

export const getCommit = () => localStorage.getItem(COMMIT_KEY) || DEFAULT_COMMIT
export const setCommit = sha => localStorage.setItem(COMMIT_KEY, sha)

function WithApplicationUpdate({ children }) {
  const [open, setOpen] = useState(true)
  const config = useContext(PluralConfigurationContext)
  const commit = getCommit()

  const reloadApplication = useCallback(() => {
    console.log('reloading')
    if (process.env.NODE_ENV === 'production') {
      const promise = serviceWorker.unregister() || Promise.resolve('done')

      promise.then(() => {
        setCommit(config.gitCommit)
        window.location.reload()
      })
    }
    else {
      setCommit(config.gitCommit)
      setOpen(false)
    }
  }, [config, setOpen])

  const stale = commit !== config.gitCommit

  if (!stale || !open) return children({ reloadApplication, shouldReloadApplication: false })

  if (commit === DEFAULT_COMMIT) {
    setCommit(config.gitCommit)

    return children({ reloadApplication, shouldReloadApplication: false })
  }

  return children({ reloadApplication, shouldReloadApplication: true })
}

export default WithApplicationUpdate
