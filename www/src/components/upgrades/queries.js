import gql from 'graphql-tag'
import { PageInfo } from '../../models/misc'
import { UpgradeFragment, UpgradeQueueFragment } from '../../models/upgrades'

export const QUEUES = gql`
  query {
    upgradeQueues {
      ...UpgradeQueueFragment
    }
  }
  ${UpgradeQueueFragment}
`

export const QUEUE = gql`
  query Queue($id: ID!, $cursor: String) {
    upgradeQueue(id: $id) {
      ...UpgradeQueueFragment
      upgrades(after: $cursor, first: 50) {
        pageInfo { ...PageInfo }
        edges { node { ...UpgradeFragment } }
      }
    }
  }
  ${PageInfo}
  ${UpgradeQueueFragment}
  ${UpgradeFragment}
`

export const UPGRADE_SUB = gql`
  subscription Upgrades($id: ID!) {
    upgrade(id: $id) { ...UpgradeFragment }
  }
  ${UpgradeFragment}
`

export const UPGRADE_QUEUE_SUB = gql`
  subscription {
    upgradeQueueDelta {
      delta
      payload { ...UpgradeQueueFragment }
    }
  }
  ${UpgradeQueueFragment}
`