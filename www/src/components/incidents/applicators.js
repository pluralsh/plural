import { appendConnection, deepUpdate } from '../../utils/graphql'

export const applyMessages = ({ incident, ...prev }, { incidentMessageDelta: { delta, payload } }) => {
  switch (delta) {
    case 'CREATE':
      return { ...prev, incident: appendConnection(incident, payload, 'messages') }
    case 'UPDATE':
      return deepUpdate(prev, 'incident.messages.edges', edges => edges.map(e => e.node.id === payload.id ? { ...e, node: payload } : e))
    case 'DELETE':
      return deepUpdate(prev, 'incident.messages.edges', edges => edges.filter(({ node: { id } }) => id !== payload.id))
    default:
      return prev
  }
}
