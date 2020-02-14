export function appendEdge(edges, newNode, type) {
  if (edges.find(({node}) => node.id === newNode.id)) return edges

  return [{__typename: type, node: newNode}, ...edges]
}

export function mergeEdges(edges, delta, payload, edgeType) {
  switch (delta) {
    case "CREATE":
      return appendEdge(edges, payload, edgeType)
    case "UPDATE":
      return edges.map((edge) => edge.node.id === payload.id ? {...edge, node: payload} : edge)
    case "DELETE":
      return edges.filter(({node: {id}}) => id !== payload.id)
    default:
      return edges
  }
}