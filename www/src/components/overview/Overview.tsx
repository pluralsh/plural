import { ReactElement } from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { ClustersContextProvider } from '../../contexts/ClustersContext'

import OverviewHeader from './OverviewHeader'

const Wrap = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  padding: theme.spacing.large,
}))

export function Overview(): ReactElement {
  return (
    <ClustersContextProvider>
      <Wrap>
        <OverviewHeader />
        <Outlet />
      </Wrap>
    </ClustersContextProvider>
  )
}
