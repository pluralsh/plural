import { Outlet, useLocation } from 'react-router-dom'
import { Flex } from 'honorable'
import {
  Input,
  PageTitle,
  SearchIcon,
  SubTab,
  TabList,
  TabPanel,
} from '@pluralsh/design-system'
import { useContext, useRef, useState } from 'react'
import styled from 'styled-components'

import { LinkTabWrap } from '../utils/Tabs'
import RepositoryContext from '../../contexts/RepositoryContext'

import { RepositoryActions } from './misc'

export function packageCardStyle(first, last) {
  return {
    backgroundColor: 'fill-one',
    hoverIndicator: 'fill-two',
    color: 'text',
    textDecoration: 'none',
    border: '1px solid border-fill-two',
    borderTop: 'none',
    borderBottomLeftRadius: last ? '4px' : 0,
    borderBottomRightRadius: last ? '4px' : 0,
    align: 'center',
    px: 1,
    py: 0.5,
  }
}

const StyledTabPanel = styled(TabPanel)(_ => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  height: '100%',
}))

const DIRECTORY = [
  { label: 'Helm charts', path: '/helm' },
  { label: 'Terraform modules', path: '/terraform' },
  { label: 'Docker repositories', path: '/docker' },
]

export default function RepositoryPackages() {
  const repository = useContext(RepositoryContext)
  const [q, setQ] = useState('')
  const { pathname } = useLocation()
  const tabStateRef = useRef<any>(null)
  const pathPrefix = `/repository/${repository.name}/packages`

  const currentTab = DIRECTORY.find(tab => pathname?.startsWith(`${pathPrefix}${tab.path}`))

  return (
    <Flex
      direction="column"
      height="100%"
    >
      <PageTitle
        heading="Packages"
        paddingTop="medium"
      >
        <Flex display-desktop-up="none"><RepositoryActions /></Flex>
      </PageTitle>
      <StyledTabPanel stateRef={tabStateRef}>
        <TabList
          stateRef={tabStateRef}
          stateProps={{
            orientation: 'horizontal',
            selectedKey: currentTab?.path,
          }}
          marginBottom="small"
        >
          {DIRECTORY.map(({ path, label }) => (
            <LinkTabWrap
              to={`${pathPrefix}${path}`}
              key={path}
              textValue={label}
              subTab
            >
              <SubTab style={{ flexGrow: 1 }}>{label}</SubTab>
            </LinkTabWrap>
          ))}
        </TabList>
        <Input
          value={q}
          onChange={event => setQ(event.target.value)}
          placeholder={`Filter ${currentTab?.label || ''}`}
          startIcon={<SearchIcon />}
          width="100%"
          backgroundColor="fill-one"
          borderBottomLeftRadius="0"
          borderBottomRightRadius="0"
        />
        <Flex
          direction="column"
          marginBottom="medium"
          flexGrow={1}
        >
          <Outlet context={[q, setQ]} />
        </Flex>
      </StyledTabPanel>
    </Flex>
  )
}
