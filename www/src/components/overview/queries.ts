import { gql } from '@apollo/client'

import { PageInfo } from '../../models/misc'
import { UpgradeFragment, UpgradeQueueFragment } from '../../models/upgrades'
import { ImpersonationPolicy } from '../../models/user'

export const CLUSTERS = gql`
query {
  clusters(first: 100) {
    pageInfo { ...PageInfo }
    edges {
      node {
        id 
        name
        provider
        source
        pingedAt
        gitUrl
        consoleUrl
        owner {
          id
          name
          email
          avatar
          hasShell
          serviceAccount
          impersonationPolicy { ...ImpersonationPolicy }
        }
        queue { 
          id
          acked
          upgrades(first: 3) { 
            edges { 
              node { 
                id
              } 
            } 
          } 
        }
        upgradeInfo {
          installation { repository { id } }
          count
        }
        dependency {
          cluster { id }
          dependency { id name }
        }
      }
    }
  }
}
${PageInfo}
${ImpersonationPolicy}
`

export const CREATE_CLUSTER_DEPENDENCY = gql`
  mutation Create($source: ID!, $dest: ID!) {
    createClusterDependency(sourceId: $source, destId: $dest) {
      cluster { id }
      dependency { id }
    }
  }
`

export const PROMOTE = gql`
  mutation {
    promote { id }
  }
`

export const QUEUES = gql`
  query Queues {
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
