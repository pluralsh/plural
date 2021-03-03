import { isString } from "lodash"

export function updateFragment(cache, {fragment, id, update, fragmentName}) {
  const current = cache.readFragment({id, fragment, fragmentName})

  if (!current) return

  cache.writeFragment({id, fragment, data: update(current), fragmentName})
}

export function extendConnection(prev, next, key) {
  const {edges, pageInfo} = next[key]
  return {...prev, [key]: {
      ...prev[key], pageInfo, edges: [...prev[key].edges, ...edges]
    }
  }
}

export function deepUpdate(prev, path, update) {
  if (isString(path)) return deepUpdate(prev, path.split('.'), update)

  const key = path[0]
  if (path.length === 1) {
    return {...prev, [key]: update(prev[key])}
  }

  return {...prev, [key]: deepUpdate(prev, path.slice(1), update)}
}

export function appendConnection(prev, next, type, key) {
  const {edges, pageInfo} = prev[key]
  if (edges.find(({node: {id}}) => id === next.id)) return prev

  return {...prev, [key]: {
      ...prev[key],  pageInfo, edges: [{__typename: `${type}Edge`, node: next}, ...edges]
    }
  }
}

export function updateCache(cache, {query, variables, update, onFailure}) {
  const prev = cache.readQuery({query, variables})
  cache.writeQuery({query, variables, data: update(prev)})
  // } catch {
  //   onFailure && onFailure()
  // }
}