import { Flex, SubTab, TabList, TabPanel } from '@pluralsh/design-system'
import { useMemo, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { LinkTabWrap } from '../utils/Tabs'

import { SubpageHeader } from '../utils/layout/SubpageLayout'

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
      <SubpageHeader title="Users">
        <Flex
          align="center"
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
      </SubpageHeader>
      <TabPanel
        as={
          <Flex
            direction="column"
            width="100%"
            height="100%"
            gap="medium"
          />
        }
        stateRef={tabStateRef}
      >
        <Outlet context={outletContext} />
      </TabPanel>
    </Flex>
  )
}
