import { useQuery } from '@apollo/client'
import isEmpty from 'lodash/isEmpty'
import { EmptyState } from '@pluralsh/design-system'
import { useState } from 'react'

import { Div } from 'honorable'

import { Placeholder } from '../utils/Placeholder'

import { extendConnection } from '../../utils/graphql'

import { ListItem } from '../utils/List'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { StandardScroller } from '../utils/SmoothScroller'

import { GROUPS_Q } from './queries'

import { CreateGroup } from './CreateGroup'
import { Group } from './Groups'

export function GroupsList({ q }: any) {
  const [listRef, setListRef] = useState<any>(null)
  const { data, loading, fetchMore } = useQuery(GROUPS_Q, { variables: { q } })

  if (!data) {
    return <LoopingLogo />
  }

  const { edges, pageInfo } = data.groups

  return (
    <Div
      flexGrow={1}
      maxHeight="max-content"
    >
      {edges?.length ? (
        <StandardScroller
          listRef={listRef}
          setListRef={setListRef}
          items={edges}
          mapper={({ node: group }, { prev, next }) => (
            <ListItem
              first={!prev.node}
              last={!next.node}
            >
              <Group
                group={group}
                q={q}
              />
            </ListItem>
          )}
          loadNextPage={() => pageInfo.hasNextPage
            && fetchMore({
              variables: { cursor: pageInfo.endCursor },
              updateQuery: (prev, { fetchMoreResult: { groups } }) => extendConnection(prev, groups, 'groups'),
            })}
          hasNextPage={pageInfo.hasNextPage}
          loading={loading}
          placeholder={Placeholder}
        />
      ) : (
        <EmptyState
          message={isEmpty(q)
            ? "Looks like you don't have any groups yet."
            : `No groups found for ${q}`}
        >
          <CreateGroup q={q} />
        </EmptyState>
      )}
    </Div>
  )
}
