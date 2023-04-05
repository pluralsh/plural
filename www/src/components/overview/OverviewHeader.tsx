import { Button, SubTab, TabList } from '@pluralsh/design-system'
import { ReactElement, useContext, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { LinkTabWrap } from '../utils/Tabs'

import ClustersContext from '../../contexts/ClustersContext'

const Wrap = styled.div(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing.medium,

  '.actions': {
    display: 'flex',
    flexGrow: 1,
    gap: theme.spacing.small,
    justifyContent: 'end',
  },
}))

const DIRECTORY = [
  { path: '/overview/clusters', label: 'Cluster overview' },
  // { path: '/overview/apps', label: 'Installed applications' },
]

export default function OverviewHeader(): ReactElement {
  const { hasClusters } = useContext(ClustersContext)
  const tabStateRef = useRef<any>(null)
  const { pathname } = useLocation()
  const currentTab = DIRECTORY.find(tab => pathname?.startsWith(tab.path))

  return (
    <Wrap>
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
      <div className="actions">
        {hasClusters && <Button secondary>Promote cluster</Button>} {/* TODO: Implement handler. */}
      </div>
    </Wrap>
  )
}
