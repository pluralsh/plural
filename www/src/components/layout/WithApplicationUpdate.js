import { useContext, useState } from 'react'

import * as serviceWorker from '../../serviceWorker'

import { PluralConfigurationContext } from '../login/CurrentUser'

const COMMIT_KEY = 'git-commit'
const DEFAULT_COMMIT = 'plural-default-commit'

const getCommit = () => localStorage.getItem(COMMIT_KEY) || DEFAULT_COMMIT
const setCommit = sha => localStorage.setItem(COMMIT_KEY, sha)

function WithApplicationUpdate({ children }) {
  const [open, setOpen] = useState(true)
  const config = useContext(PluralConfigurationContext)

  function reloadApplication() {
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
  }

  const stale = getCommit() !== config.gitCommit

  if (!(stale && open)) return children({ reloadApplication, shouldReloadApplication: false })

  if (getCommit() === DEFAULT_COMMIT) {
    setCommit(config.gitCommit)

    return children({ reloadApplication, shouldReloadApplication: false })
  }

  return children({ reloadApplication, shouldReloadApplication: true })
}

export default WithApplicationUpdate
