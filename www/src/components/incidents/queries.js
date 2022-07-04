import { gql } from '@apollo/client'

import { RepoFragment } from '../../models/repo'
import { FileFragment, FollowerFragment, IncidentFragment, IncidentHistoryFragment, IncidentMessageFragment, NotificationFragment, PostmortemFragment } from '../../models/incidents'
import { PageInfo } from '../../models/misc'

export const INCIDENTS_Q = gql`
  query Incidents($repositoryId: ID, $supports: Boolean, $q: String, $cursor: String, $order: Order, $sort: IncidentSort, $filters: [IncidentFilter]) {
    incidents(repositoryId: $repositoryId, supports: $supports, q: $q, after: $cursor, first: 20, order: $order, sort: $sort, filters: $filters) {
      pageInfo { ...PageInfo }
      edges { node { ...IncidentFragment } }
    }
  }
  ${PageInfo}
  ${IncidentFragment}
`

export const SEARCH_USERS = gql`
  query Search($incidentId: ID!, $q: String!, $cursor: String) {
    searchUsers(incidentId: $incidentId, q: $q, after: $cursor, first: 10) {
      pageInfo { ...PageInfo }
      edges { node { id name email avatar backgroundColor } }
    }
  }
  ${PageInfo}
`

export const INCIDENT_Q = gql`
  query Incident($id: ID! $cursor: String, $fileCursor: String, $historyCursor: String, $followerCursor: String) {
    incident(id: $id) {
      ...IncidentFragment
      postmortem { ...PostmortemFragment }
      follower { ...FollowerFragment }

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

      followers(after: $followerCursor, first: 50) {
        pageInfo { ...PageInfo }
        edges { node { ...FollowerFragment } }
      }
    }
  }
  ${IncidentFragment}
  ${PageInfo}
  ${IncidentMessageFragment}
  ${FileFragment}
  ${IncidentHistoryFragment}
  ${PostmortemFragment}
  ${FollowerFragment}
`

export const NOTIFICATIONS_Q = gql`
  query Notifications($incidentId: ID, $cursor: String) {
    notifications(incidentId: $incidentId, first: 50, after: $cursor) {
      pageInfo { ...PageInfo }
      edges { node { ...NotificationFragment } }
    }
  }
  ${PageInfo}
  ${NotificationFragment}
`

export const REPOS_Q = gql`
  query Repos($cursor: String) {
    repositories(supports: true, first: 15, after: $cursor) {
      pageInfo { ...PageInfo }
      edges { node { ...RepoFragment } }
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

export const DELETE_INCIDENT = gql`
  mutation Delete($id: ID!) {
    deleteIncident(id: $id) {
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

export const COMPLETE_INCIDENT = gql`
  mutation Complete($id: ID!, $attributes: PostmortemAttributes!) {
    completeIncident(id: $id, postmortem: $attributes) {
      ...IncidentFragment
      postmortem { ...PostmortemFragment }
    }
  }
  ${IncidentFragment}
  ${PostmortemFragment}
`

export const FOLLOW = gql`
  mutation Follow($id: ID!, $attributes: FollowerAttributes!) {
    followIncident(id: $id, attributes: $attributes) {
      ...FollowerFragment
    }
  }
  ${FollowerFragment}
`

export const UNFOLLOW = gql`
  mutation Unfollow($id: ID!) {
    unfollowIncident(id: $id) { ...FollowerFragment }
  }
  ${FollowerFragment}
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
`

export const READ_NOTIFICATIONS = gql`
  mutation Read($incidentId: ID!) {
    readNotifications(incidentId: $incidentId)
  }
`

export const INCIDENT_SUB = gql`
  subscription Incident($id: ID!) {
    incidentDelta(incidentId: $id) {
      delta
      payload {
        ...IncidentFragment
        postmortem { ...PostmortemFragment }
        history(first: 50) {
          pageInfo { ...PageInfo }
          edges { node { ...IncidentHistoryFragment } }
        }
      }
    }
  }
  ${PageInfo}
  ${IncidentFragment}
  ${PostmortemFragment}
  ${IncidentHistoryFragment}
`

export const MESSAGE_SUB = gql`
  subscription Messages($id: ID!) {
    incidentMessageDelta(incidentId: $id) {
      delta
      payload { ...IncidentMessageFragment }
    }
  }
  ${IncidentMessageFragment}
`
export const NOTIF_SUB = gql`
  subscription {
    notification { ...NotificationFragment }
  }
  ${NotificationFragment}
`

export const ZOOM_MEETING = gql`
  mutation Zoom($attributes: ZoomMeetingAttributes!) {
    createZoom(attributes: $attributes) { joinUrl password }
  }
`
