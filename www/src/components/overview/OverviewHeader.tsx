import { Button, SubTab, TabList } from '@pluralsh/design-system'
import {
  ReactElement,
  useContext,
  useRef,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'
import { Flex } from 'honorable'

import { LinkTabWrap } from '../utils/Tabs'
import ClustersContext from '../../contexts/ClustersContext'

import { PromoteClusterModal } from './PromoteClusterModal'

const DIRECTORY = [
  { path: '/overview/clusters', label: 'Cluster overview' },
  // { path: '/overview/apps', label: 'Installed applications' },
]

export default function OverviewHeader(): ReactElement {
  const [promoteClusterModalOpen, setPromoteClusterModalOpen] = useState(false)
  const { clusters } = useContext(ClustersContext)
  const tabStateRef = useRef<any>(null)
  const { pathname } = useLocation()
  const currentTab = DIRECTORY.find(tab => pathname?.startsWith(tab.path))

  return (
    <Flex marginBottom="medium">
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
      <Flex
        grow={1}
        justify="end"
      >
        {clusters?.length > 1 && (
          <>
            <Button
              secondary
              onClick={() => setPromoteClusterModalOpen(true)}
            >
              Promote cluster
            </Button>
            <PromoteClusterModal
              open={promoteClusterModalOpen}
              setOpen={setPromoteClusterModalOpen}
            />
          </>
        )}
      </Flex>
    </Flex>
  )
}
