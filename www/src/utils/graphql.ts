import isString from 'lodash/isString'

import { MutationUpdaterFunction } from '@apollo/client/core/types'

import uniqWith from 'lodash/uniqWith'

import { UserFragment } from '../models/user'
import { RootMutationType, RootMutationTypeUpdateUserArgs } from '../generated/graphql'

export function updateFragment(cache, {
  fragment, id, update, fragmentName,
}) {
  const current = cache.readFragment({ id, fragment, fragmentName })

  if (!current) return

  cache.writeFragment({
    id, fragment, data: update(current), fragmentName,
  })
}

export function extendConnection(prev, next, key) {
  const { edges, pageInfo } = next
  const uniq = uniqWith([...prev[key].edges, ...edges], (a, b) => (a.node?.id ? a.node?.id === b.node?.id : false))

  return {
    ...prev,
    [key]: {
      ...prev[key], pageInfo, edges: uniq,
    },
  }
}

export function deepUpdate(prev, path, update) {
  if (isString(path)) return deepUpdate(prev, path.split('.'), update)

  const key = path[0]

  if (path.length === 1) {
    return { ...prev, [key]: update(prev[key]) }
  }

  return { ...prev, [key]: deepUpdate(prev[key], path.slice(1), update) }
}

export function appendConnection(prev, next, key) {
  const { edges, pageInfo } = prev[key]

  if (edges.find(({ node: { id } }) => id === next.id)) return prev

  return {
    ...prev,
    [key]: {
      ...prev[key], pageInfo, edges: [{ __typename: `${next.__typename}Edge`, node: next }, ...edges],
    },
  }
}

export function removeConnection(prev, val, key) {
  return { ...prev, [key]: { ...prev[key], edges: prev[key].edges.filter(({ node }) => node.id !== val.id) } }
}

export function updateCache(cache, { query, variables, update }) {
  const prev = cache.readQuery({ query, variables })

  cache.writeQuery({ query, variables, data: update(prev) })
}

// eslint-disable-next-line
export const prune = ({ __typename, ...rest }) => rest

export function deepFetch(map, path) {
  if (isString(path)) return deepFetch(map, path.split('.'))

  const key = path[0]

  if (path.length === 1) return map[key]
  if (!map[key]) return null

  return deepFetch(map[key], path.slice(1))
}

export const updateUserFragment: MutationUpdaterFunction<RootMutationType, RootMutationTypeUpdateUserArgs, any, any> = (cache, { data }) => {
  cache.modify({
    fields: {
      me: () => cache.writeFragment({
        data: data?.updateUser,
        fragment: UserFragment,
      }),
    },
  })
}
