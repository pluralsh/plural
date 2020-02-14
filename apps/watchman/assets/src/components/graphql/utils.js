function appendList(list, payload) {
  if (list.find(({id}) => id === payload.id)) return list
  return [payload, ...list]
}

export function mergeList(list, delta, payload) {
  switch (delta) {
    case "CREATE":
      return appendList(list, payload)
    case "UPDATE":
      return list.map((item) => item.id === payload.id ? payload : item)
    case "DELETE":
      return list.filter(({id}) => id !== payload.id)
    default:
      return list
  }
}

export function appendEdge(edges, newNode, type, appendType) {
  if (edges.find(({node}) => node.id === newNode.id)) return edges

  return (
    appendType === 'append' ?
      [...edges, {__typename: type, node: newNode}] :
      [{__typename: type, node: newNode}, ...edges]
  )
}

export function mergeEdges(edges, delta, payload, edgeType, appendType) {
  switch (delta) {
    case "CREATE":
      return appendEdge(edges, payload, edgeType, appendType)
    case "UPDATE":
      return edges.map((edge) => edge.node.id === payload.id ? {...edge, node: payload} : edge)
    case "DELETE":
      return edges.filter(({node: {id}}) => id !== payload.id)
    default:
      return edges
  }
}