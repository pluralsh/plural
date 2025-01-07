import { Button, SubTab, TabList } from '@pluralsh/design-system'
import { Flex } from 'honorable'
import { ReactElement, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { LinkTabWrap } from '../utils/Tabs'

const DIRECTORY = [
  { path: '/overview/clusters/self-hosted', label: 'Self-hosted clusters' },
  { path: '/overview/clusters/plural-cloud', label: 'Plural cloud instances' },
]

export default function OverviewHeader(): ReactElement {
  const tabStateRef = useRef<any>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const currentTab = DIRECTORY.find((tab) => pathname?.startsWith(tab.path))

  // const [showUnfinished, setShowUnfinished] = useState(hasUnfinishedCreation())
  // const { triggerDelete, loading } = useDeleteUnfinishedInstance({
  //   onClear: () => setShowUnfinished(false),
  // })

  return (
    <Flex justifyContent="space-between">
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
      <Flex gap="medium">
        {/* {showUnfinished && (
          <Button
            destructive
            loading={loading}
            onClick={triggerDelete}
          >
            Cancel cluster creation
          </Button>
        )} */}
        <Button onClick={() => navigate('/create-cluster')}>
          Create cluster
        </Button>
      </Flex>
    </Flex>
  )
}
