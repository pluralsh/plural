export function extendConnection(prev, next, key) {
  const {edges, pageInfo} = next[key]
  return {...prev, [key]: {
      ...prev[key],  pageInfo, edges: [...prev[key].edges, ...edges]
    }
  }
}

export function appendConnection(prev, next, type, key) {
  const {edges, pageInfo} = prev[key]
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