import { useCallback, useContext, useState } from 'react'

import { Download } from 'forge-core'

import { Box } from 'grommet'

import * as serviceWorker from '../../serviceWorker'

import { Icon } from '../utils/Icon'

import { PluralConfigurationContext } from './CurrentUser'

const COMMIT_KEY = 'git-commit'

const getCommit = () => localStorage.getItem(COMMIT_KEY) || 'example'
const setCommit = sha => localStorage.setItem(COMMIT_KEY, sha)

export function AutoRefresh() {
  const [open, setOpen] = useState(true)
  const config = useContext(PluralConfigurationContext)
  const reload = useCallback(() => {
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
  }, [config])

  const stale = getCommit() !== config.gitCommit

  if (!stale || !open) return null

  if (getCommit() === 'example') {
    setCommit(config.gitCommit)

    return null
  }

  return (
    <Box
      flex={false}
      margin={{ left: 'small' }}
    >
      <Icon
        icon={(
          <Download
            size="15px"
            color="orange"
          />
        )}
        onClick={reload}
        text="Update ready!"
        align={{ top: 'bottom' }}
      />
    </Box>
  )
}
