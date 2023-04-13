import styled from 'styled-components'
import { AppList, AppProps, LoopingLogo } from '@pluralsh/design-system/dist'
import { useContext, useMemo } from 'react'
import { useQuery } from '@apollo/client'

import { TerminalContext } from '../../context/terminal'
import { FULL_APPLICATIONS_QUERY } from '../installer/queries'

import { toAppProps } from './helpers'

const Installed = styled(InstalledUnstyled)(({ theme }) => ({
  width: '600px',
  paddingTop: theme.spacing.xxsmall,
  flexGrow: 1,
  overflow: 'hidden',

  '.app-launch-btn': {
    marginRight: theme.spacing.xsmall,
  },

  '&#loader': {
    display: 'flex',
    flexGrow: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
}))

const POLL_INTERVAL = 5000

function buildAppInfo(shellApplications) {
  return (shellApplications || []).reduce((res, app) => {
    res[app.name] = app

    return res
  }, {})
}

function InstalledUnstyled({ ...props }): JSX.Element {
  const { shell: { provider }, onAction } = useContext(TerminalContext)

  const { data: { repositories: { edges: nodes } = { edges: [] }, shellApplications } = {}, loading } = useQuery(FULL_APPLICATIONS_QUERY,
    {
      variables: { provider, installed: true },
      skip: !provider,
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
      pollInterval: POLL_INTERVAL,
    })

  const apps: Array<AppProps> = useMemo(() => (onAction ? nodes.map(node => toAppProps(node, buildAppInfo(shellApplications), onAction)) : []), [nodes, shellApplications, onAction])

  if (loading) {
    return (
      <div
        id="loader"
        {...props}
      >
        <LoopingLogo />
      </div>
    )
  }

  return (
    <div {...props}>
      <AppList apps={apps} />
    </div>
  )
}

export { Installed }
