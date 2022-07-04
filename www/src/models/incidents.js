import { gql } from '@apollo/client'

import { PlanFragment } from './payments'
import { RepoFragment } from './repo'
import { UserFragment } from './user'

export const PostmortemFragment = gql`
  fragment PostmortemFragment on Postmortem {
    id
    content
    actionItems { type link }
  }
`
export const FollowerFragment = gql`
  fragment FollowerFragment on Follower {
    id
    incident { id }
    user { ...UserFragment }
    preferences { message incidentUpdate mention }
  }
  ${UserFragment}
`

export const SubscriptionFragment = gql`
  fragment SubscriptionFragment on SlimSubscription {
    id
    lineItems { items { dimension quantity } }
    plan { ...PlanFragment }
  }
  ${PlanFragment}
`

export const ClusterInformation = gql`
  fragment ClusterInformation on ClusterInformation {
    version
    gitCommit
    platform
  }
`

export const IncidentFragment = gql`
  fragment IncidentFragment on Incident {
    id
    title
    description
    severity
    status
    notificationCount
    nextResponseAt
    creator { ...UserFragment }
    owner { ...UserFragment }
    repository { ...RepoFragment }
    subscription { ...SubscriptionFragment }
    clusterInformation { ...ClusterInformation }
    tags { tag }
    insertedAt
  }
  ${UserFragment}
  ${RepoFragment}
  ${SubscriptionFragment}
  ${ClusterInformation}
`

export const IncidentHistoryFragment = gql`
  fragment IncidentHistoryFragment on IncidentHistory {
    id
    action
    changes { key prev next }
    actor { ...UserFragment }
    insertedAt
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
    entities { type user { ...UserFragment } text startIndex endIndex }
    insertedAt
  }
  ${UserFragment}
  ${FileFragment}
`

export const NotificationFragment = gql`
  fragment NotificationFragment on Notification {
    id
    type
    msg
    actor { ...UserFragment }
    incident { id title repository { id name icon darkIcon } }
    message { text }
    repository { id name icon darkIcon }
    insertedAt
  }
  ${UserFragment}
`
