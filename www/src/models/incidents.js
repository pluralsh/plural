import gql from 'graphql-tag'
import { RepoFragment } from './repo'
import { UserFragment } from './user'

export const IncidentFragment = gql`
  fragment IncidentFragment on Incident {
    id
    title
    description
    severity
    status
    creator { ...UserFragment }
    owner { ...UserFragment }
    repository { ...RepoFragment }
    tags { tag }
    insertedAt
  }
  ${UserFragment}
  ${RepoFragment}
`

export const IncidentHistoryFragment = gql`
  fragment IncidentHistoryFragment on IncidentHistory {
    id
    action
    changes { key prev next }
    actor { ...UserFragment }
  }
  ${UserFragment}
`

export const FileFragment = gql`
  fragment FileFragment on File {
    id
    blob
    mediaType
    contentType
    filesize
    filename
  }
`

export const IncidentMessageFragment = gql`
  fragment IncidentMessageFragment on IncidentMessage {
    id
    text
    creator { ...UserFragment }
    reactions { name creator { id email } }
    file { ...FileFragment }
    insertedAt
  }
  ${UserFragment}
  ${FileFragment}
`