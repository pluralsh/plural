import gql from 'graphql-tag'
import { RepoFragment } from '../../models/repo'
import { FileFragment, IncidentFragment, IncidentHistoryFragment, IncidentMessageFragment } from '../../models/incidents';
import { PageInfo } from '../../models/misc'

export const INCIDENTS_Q = gql`
  query Incidents($repositoryId: ID, $q: String, $cursor: String) {
    incidents(repositoryId: $repositoryId, q: $q, after: $cursor, first: 20) {
      pageInfo { ...PageInfo }
      edges { node { ...IncidentFragment } }
    }
  }
  ${PageInfo}
  ${IncidentFragment}
`;

export const INCIDENT_Q = gql`
  query Incident($id: ID! $cursor: String, $fileCursor: String, $historyCursor: String) {
    incident(id: $id) {
      ...IncidentFragment
      messages(after: $cursor, first: 50) {
        pageInfo { ...PageInfo }
        edges { node { ...IncidentMessageFragment } }
      }
      files(after: $fileCursor, first: 50) {
        pageInfo { ...PageInfo }
        edges { node { ...FileFragment } }
      }
      history(after: $historyCursor, first: 50) {
        pageInfo { ...PageInfo }
        edges { node { ...IncidentHistoryFragment } }
      }
    }
  }
  ${IncidentFragment}
  ${PageInfo}
  ${IncidentMessageFragment}
  ${FileFragment}
  ${IncidentHistoryFragment}
`

export const REPOS_Q = gql`
  query Repos($cursor: String) {
    repositories(supports: true, first: 15, after: $cursor) {
      pageInfo { ...PageInfo }
      edges {
        node { ...RepoFragment }
      }
    }
  }
  ${PageInfo}
  ${RepoFragment}
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

export const ACCEPT_INCIDENT = gql`
  mutation Accept($id: ID!) {
    acceptIncident(id: $id) {
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

export const CREATE_REACTION = gql`
  mutation Create($id: ID!, $name: String!) {
    createReaction(messageId: $id, name: $name) { ...IncidentMessageFragment }
  }
  ${IncidentMessageFragment}
`

export const DELETE_REACTION = gql`
  mutation Delete($id: ID!, $name: String!) {
    deleteReaction(messageId: $id, name: $name) { ...IncidentMessageFragment }
  }
  ${IncidentMessageFragment}
`;