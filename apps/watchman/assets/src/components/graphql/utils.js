export function mergeEdges(edges, delta, payload, edgeType) {
  switch (delta) {
    case "CREATE":
      return [{__typename: edgeType, node: payload}, ...edges]
    case "UPDATE":
      return edges.map((edge) => edge.node.id === payload.id ? {...edge, node: payload} : edge)
    case "DELETE":
      return edges.filter(({node: {id}}) => id !== payload.id)
    default:
      return edges
  }
}