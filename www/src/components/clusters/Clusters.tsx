import { SubTab, TabList } from '@pluralsh/design-system'
import { ReactElement, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { LinkTabWrap } from '../utils/Tabs'

const Wrap = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  padding: theme.spacing.large,

  '.header': {
    marginBottom: theme.spacing.medium,
  },
}))

const DIRECTORY = [
  { path: '/clusters/overview', label: 'Cluster overview' },
  { path: '/clusters/apps', label: 'Installed applications' },
]

export function Clusters(): ReactElement {
  const tabStateRef = useRef<any>(null)
  const { pathname } = useLocation()
  const currentTab = DIRECTORY.find(tab => pathname?.startsWith(tab.path))

  return (
    <Wrap>
      <div className="header">
        <TabList
          stateRef={tabStateRef}
          stateProps={{
            orientation: 'horizontal',
            selectedKey: currentTab?.path,
          }}
        >
          {DIRECTORY.map(({ label, path }) => (
            <LinkTabWrap
              key={path}
              textValue={label}
              to={path}
            >
              <SubTab>{label}</SubTab>
            </LinkTabWrap>
          ))}
        </TabList>
      </div>
      <Outlet />
    </Wrap>
  )
}
