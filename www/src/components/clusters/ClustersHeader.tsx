import { Button, SubTab, TabList } from '@pluralsh/design-system'
import { ReactElement, useContext, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { LinkTabWrap } from '../utils/Tabs'

import ClustersContext from './ClustersContext'

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
  { path: '/clusters/overview', label: 'Cluster overview' },
  // { path: '/clusters/apps', label: 'Installed applications' },
]

export default function ClustersHeader(): ReactElement {
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
        {hasClusters
          // TODO: Implement logic for both buttons.
          ? <Button secondary>Promote cluster</Button>
          : <Button>Create cluster</Button>}
      </div>
    </Wrap>
  )
}
