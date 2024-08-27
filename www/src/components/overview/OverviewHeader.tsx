import { Button, SubTab, TabList } from '@pluralsh/design-system'
import { Flex } from 'honorable'
import { ReactElement, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { LinkTabWrap } from '../utils/Tabs'

// TODO: add toggle between self-hosted and plural-cloud instances
const DIRECTORY = [{ path: '/overview/clusters', label: 'Cluster overview' }]

export default function OverviewHeader(): ReactElement {
  const tabStateRef = useRef<any>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const currentTab = DIRECTORY.find((tab) => pathname?.startsWith(tab.path))

  return (
    <Flex
      marginBottom="medium"
      justifyContent="space-between"
    >
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
      <Button onClick={() => navigate('/create-cluster')}>
        Create Cluster
      </Button>
    </Flex>
  )
}
