import { ReactElement } from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { ClustersContextProvider } from './ClustersContextProvider'
import ClustersHeader from './ClustersHeader'

const Wrap = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  padding: theme.spacing.large,
}))

export function Clusters(): ReactElement {
  return (
    <ClustersContextProvider>
      <Wrap>
        <ClustersHeader />
        <Outlet />
      </Wrap>
    </ClustersContextProvider>
  )
}
