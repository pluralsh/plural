import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import * as serviceWorker from '../../serviceWorkerRegistration'

import { PluralConfigurationContext } from '../login/CurrentUser'

const COMMIT_KEY = 'git-commit'

export const DEFAULT_COMMIT = 'plural-default-commit'

export const getCommit = () => sessionStorage.getItem(COMMIT_KEY) || DEFAULT_COMMIT
export const setCommit = sha => sessionStorage.setItem(COMMIT_KEY, sha)

function WithApplicationUpdate({ children }) {
  const [time, setTime] = useState(Date.now())
  const config = useContext(PluralConfigurationContext)
  const commit = getCommit()
  const [stale, setStale] = useState(commit !== config.gitCommit)
  const reloadApplication = useCallback(() => {
    const promise = serviceWorker.unregister() || Promise.resolve('done')

    setStale(false)

    promise.then(() => {
      setCommit(config.gitCommit)
      window.location.reload()
    })
  }, [config])
  const reloadOnStale = () => (stale ? reloadApplication() : null)

  // force rerender every 60s to check if version hasn't changed
  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 60000)

    setStale(commit !== config.gitCommit)

    return () => clearInterval(interval)
  }, [time, setStale, commit, config])

  // Run only once on first app load
  // It enforces full app reload if app has been updated
  // Empty deps array is intentional here as it allows to run this effect only once.
  useEffect(() => {
    reloadOnStale()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (commit === DEFAULT_COMMIT) setCommit(config.gitCommit)

  if (stale) return children({ reloadApplication })

  return undefined
}

export default WithApplicationUpdate
