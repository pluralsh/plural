import { PageTitle, SubTab, TabList, TabPanel } from '@pluralsh/design-system'
import { Box } from 'grommet'
import { Flex } from 'honorable'
import { useMemo, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { LinkTabWrap } from '../utils/Tabs'

import InviteUserButton from './invite/InviteUserButton'

const DIRECTORY = [
  {
    path: '/account/users',
    label: 'Users',
  },
  {
    path: '/account/users/invites',
    label: 'Invites',
  },
]

export function Users() {
  const { pathname } = useLocation()
  const currentTab = [...DIRECTORY]
    .reverse()
    .find((tab) => pathname?.startsWith(tab.path))
  const tabStateRef = useRef<any>(null)
  const refetchInvites = useRef<() => void | null>(null)
  const outletContext = useMemo(
    () => ({
      refetchInvites,
    }),
    []
  )

  return (
    <Flex
      flexGrow={1}
      flexDirection="column"
      maxHeight="100%"
    >
      <PageTitle heading="Users">
        <Flex
          alignItems="flex-end"
          gap="medium"
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
          <InviteUserButton onInvite={refetchInvites.current} />
        </Flex>
      </PageTitle>
      <TabPanel
        as={
          <Box
            fill
            gap="medium"
          />
        }
        stateRef={tabStateRef}
      >
        <Outlet context={outletContext} />
        {/* {selectedKey === 'Users' && <UsersList />}
        {selectedKey === 'Invites' && <Invites />} */}
      </TabPanel>
    </Flex>
  )
}
