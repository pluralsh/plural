import gql from 'graphql-tag'
import { IncidentFragment, IncidentMessageFragment } from '../../models/incidents';
import { PageInfo } from '../../models/misc'

export const INCIDENTS_Q = gql`
  query Incidents($repositoryId: ID, $cursor: String) {
    incidents(repositoryId: $repositoryId, after: $cursor, first: 20) {
      pageInfo { ...PageInfo }
      edges { node { ...IncidentFragment } }
    }
  }
  ${PageInfo}
  ${IncidentFragment}
`;

export const INCIDENT_Q = gql`
  query Incident($id: ID!, $cursor: String) {
    incident(id: $id) {
      ...IncidentFragment
      messages(after: $cursor, first: 50) {
        pageInfo { ...PageInfo }
        edges { node { ...IncidentMessageFragment } }
      }
    }
  }
  ${IncidentFragment}
  ${PageInfo}
  ${IncidentMessageFragment}
`

export const CREATE_INCIDENT = gql`
  mutation CreateIncident($repositoryId: ID!, $attributes: IncidentAttributes!) {
    createIncident(repositoryId: $repositoryId, attributes: $attributes) {
      ...IncidentFragment
    }
  }
  ${IncidentFragment}
`

export const UPDATE_INCIDENT = gql`
  mutation UpdateIncident($id: ID!, $attributes: IncidentAttributes!) {
    updateIncident(id: $id, attributes: $attributes) {
      ...IncidentFragment
    }
  }
  ${IncidentFragment}
`

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($incidentId: ID!, $attributes: IncidentMessageAttributes!) {
    createMessage(incidentId: $incidentId, attributes: $attributes) {
      ...IncidentMessageFragment
    }
  }
  ${IncidentMessageFragment}
`

export const UPDATE_MESSAGE = gql`
  mutation CreateMessage($id: ID!, $attributes: IncidentMessageAttributes!) {
    updateMessage(id: $id, attributes: $attributes) {
      ...IncidentMessageFragment
    }
  }
  ${IncidentMessageFragment}
`

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($id: ID!) {
    deleteMessage(id: $id) {
      ...IncidentMessageFragment
    }
  }
  ${IncidentMessageFragment}
`