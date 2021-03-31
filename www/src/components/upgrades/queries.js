import gql from 'graphql-tag'
import { PageInfo } from '../../models/misc'
import { UpgradeFragment, UpgradeQueueFragment } from '../../models/upgrades'

export const QUEUE = gql`
  query Queue($cursor: String) {
    upgradeQueue {
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
  subscription {
    upgrade { ...UpgradeFragment }
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