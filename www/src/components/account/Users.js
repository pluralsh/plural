import { useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { Input } from 'honorable'
import { SearchIcon } from 'pluralsh-design-system'
import { useCallback, useState } from 'react'

import { extendConnection, removeConnection, updateCache } from '../../utils/graphql'
import { Placeholder } from '../accounts/Audits'
import { USERS_Q } from '../accounts/queries'
import { ListItem } from '../profile/ListItem'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { ButtonGroup } from '../utils/ButtonGroup'
import { Container } from '../utils/Container'
import { StandardScroller } from '../utils/SmoothScroller'

import { Invites } from './Invites'

import { InviteUser } from './InviteUser'

import { User } from './User'

function Header({ q, setQ, setView }) {
  return (
    <Box
      fill="horizontal"
      direction="row"
      align="center"
      gap="medium"
    >
      <Input
        width="80%"
        value={q}
        placeholder="search for users by name/email"
        startIcon={<SearchIcon size={15} />}
        onChange={({ target: { value } }) => setQ(value)}
      />
      <ButtonGroup
        tabs={['Users', 'Invites']}
        default="Users"
        onChange={v => setView(v)}
      />
      <Box
        fill="horizontal"
        justify="end"
        direction="row"
        align="center"
      >
        <InviteUser />
      </Box>
    </Box>
  )
}

function UsersInner({ q }) {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(USERS_Q, { variables: { q }, fetchPolicy: 'cache-and-network' })
  const update = useCallback((cache, { data: { deleteUser } }) => updateCache(cache, {
    query: USERS_Q,
    variables: { q },
    update: prev => removeConnection(prev, deleteUser, 'users'),
  }), [q])

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
        loadNextPage={() => pageInfo.hasNextPage && fetchMore({
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

export function Users() {
  const [q, setQ] = useState('')
  const [view, setView] = useState('Users')

  return (
    <Container type="table">
      <Box
        fill
        gap="medium"
      >
        <Header
          q={q}
          setQ={setQ}
          setView={setView}
        />
        {view === 'Users' && <UsersInner q={q} />}
        {view === 'Invites' && <Invites />}
      </Box>
    </Container>
  )
}
