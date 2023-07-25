import { SearchIcon } from '@pluralsh/design-system'
import { Div } from 'honorable'
import { useCallback, useEffect, useState } from 'react'

import { UsersDocument, useUsersQuery } from '../../generated/graphql'
import {
  extendConnection,
  removeConnection,
  updateCache,
} from '../../utils/graphql'
import { List, ListItem } from '../utils/List'
import ListInput from '../utils/ListInput'
import LoadingIndicator from '../utils/LoadingIndicator'
import { Placeholder } from '../utils/Placeholder'
import { StandardScroller } from '../utils/SmoothScroller'

import { User } from './User'

export function UsersList() {
  const [q, setQ] = useState('')
  const [listRef, setListRef] = useState<any>(null)
  const { data, loading, fetchMore } = useUsersQuery({
    variables: { q },
    fetchPolicy: 'cache-and-network',
  })
  const [dataCache, setDataCache] = useState(data)

  useEffect(() => {
    if (data) {
      setDataCache(data)
    }
  }, [data])

  const update = useCallback(
    (cache, { data: { deleteUser } }) =>
      updateCache(cache, {
        query: UsersDocument,
        variables: { q },
        update: (prev) => removeConnection(prev, deleteUser, 'users'),
      }),
    [q]
  )

  const { edges, pageInfo } = data?.users || dataCache?.users || {}

  return (
    <List>
      <ListInput
        width="100%"
        value={q}
        placeholder="Search a user"
        startIcon={<SearchIcon color="text-light" />}
        onChange={({ target: { value } }) => setQ(value)}
        flexGrow={0}
      />
      <Div
        flexGrow={1}
        width="100%"
      >
        {!data && !dataCache ? (
          <LoadingIndicator />
        ) : (
          <StandardScroller
            listRef={listRef}
            setListRef={setListRef}
            items={edges}
            mapper={({ node: user }, { prev, next }) => (
              <ListItem
                key={user.id}
                first={!prev.node}
                last={!next.node}
              >
                <User
                  user={user}
                  update={update}
                />
              </ListItem>
            )}
            loadNextPage={() =>
              pageInfo?.hasNextPage &&
              fetchMore({
                variables: { cursor: pageInfo?.endCursor },
                updateQuery: (prev, { fetchMoreResult: { users } }) =>
                  extendConnection(prev, users, 'users'),
              })
            }
            hasNextPage={pageInfo?.hasNextPage}
            loading={loading}
            placeholder={Placeholder}
          />
        )}
      </Div>
    </List>
  )
}
