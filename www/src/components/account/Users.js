import { useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { Flex } from 'honorable'
import {
  Input, PageTitle, SearchIcon, SubTab, TabList, TabPanel,
} from 'pluralsh-design-system'
import { useCallback, useRef, useState } from 'react'

import {
  extendConnection,
  removeConnection,
  updateCache,
} from '../../utils/graphql'
import { Placeholder } from '../accounts/Audits'
import { USERS_Q } from '../accounts/queries'
import { ListItem } from '../profile/ListItem'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { StandardScroller } from '../utils/SmoothScroller'

import { Invites } from './Invites'

import { InviteUser } from './InviteUser'

import { User } from './User'

function Header({ q, setQ }) {
  return (
    <Box
      fill="horizontal"
      direction="row"
      align="center"
      gap="medium"
    >
      <Input
        width="100%"
        value={q}
        placeholder="Search a user"
        startIcon={<SearchIcon size={15} />}
        onChange={({ target: { value } }) => setQ(value)}
      />
    </Box>
  )
}

function UsersInner({ q }) {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(USERS_Q, {
    variables: { q },
    fetchPolicy: 'cache-and-network',
  })
  const update = useCallback((cache, { data: { deleteUser } }) => updateCache(cache, {
    query: USERS_Q,
    variables: { q },
    update: prev => removeConnection(prev, deleteUser, 'users'),
  }),
  [q])

  if (!data) return <LoopingLogo />

  const { edges, pageInfo } = data.users

  return (
    <Box
      fill
      pad={{ bottom: 'small' }}
    >
      <StandardScroller
        listRef={listRef}
        setListRef={setListRef}
        items={edges}
        mapper={({ node: user }, { prev, next }) => (
          <ListItem
            first={!prev.node}
            last={!next.node}
          >
            <User
              user={user}
              update={update}
            />
          </ListItem>
        )}
        loadNextPage={() => pageInfo.hasNextPage
          && fetchMore({
            variables: { cursor: pageInfo.endCursor },
            updateQuery: (prev, { fetchMoreResult: { users } }) => extendConnection(prev, users, 'users'),
          })}
        hasNextPage={pageInfo.hasNextPage}
        loading={loading}
        placeholder={Placeholder}
      />
    </Box>
  )
}

const DIRECTORY = [
  {
    key: 'Users',
    label: 'Users',
  },
  {
    key: 'Invites',
    label: 'Invites',
  },
]

export function Users() {
  const [q, setQ] = useState('')

  const [selectedKey, setSelectedKey] = useState('Users')
  const tabStateRef = useRef()

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
              selectedKey,
              onSelectionChange: setSelectedKey,
            }}
          >
            {DIRECTORY.map(({ label, key }) => (
              <SubTab
                key={key}
                textValue={label}
              >
                {label}
              </SubTab>
            ))}
          </TabList>
          <InviteUser />
        </Flex>
      </PageTitle>
      <TabPanel
        as={(
          <Box
            fill
            gap="medium"
          />
        )}
        stateRef={tabStateRef}
      >
        <Header
          q={q}
          setQ={setQ}
        />
        {selectedKey === 'Users' && <UsersInner q={q} />}
        {selectedKey === 'Invites' && <Invites />}
      </TabPanel>
    </Flex>
  )
}
