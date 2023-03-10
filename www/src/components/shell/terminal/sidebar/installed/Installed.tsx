import styled from 'styled-components'
import { AppList, AppProps, LoopingLogo } from '@pluralsh/design-system/dist'
import { useContext, useMemo } from 'react'
import { useQuery } from '@apollo/client'

import { TerminalContext } from '../../context/terminal'
import { APPLICATIONS_QUERY } from '../installer/queries'

import { toAppProps } from './helpers'

const Installed = styled(InstalledUnstyled)(({ theme }) => ({
  width: '600px',
  paddingTop: theme.spacing.large,
  height: 'calc(100% - 56px)',

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

const POLL_INTERVAL = 15000

function InstalledUnstyled({ ...props }): JSX.Element {
  const { shell: { provider }, configuration, onAction } = useContext(TerminalContext)

  const { data: { repositories: { edges: nodes } = { edges: [] } } = {}, loading } = useQuery(APPLICATIONS_QUERY,
    {
      variables: { provider, installed: true },
      skip: !provider,
      fetchPolicy: 'network-only',
      pollInterval: POLL_INTERVAL,
    })

  const apps: Array<AppProps> = useMemo(() => (onAction ? nodes.map(node => toAppProps(node, configuration, onAction)) : []), [configuration, nodes, onAction])

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
