import { gql } from '@apollo/client'

import { RepoFragment } from './repo'

export const UpgradeQueueFragment = gql`
  fragment UpgradeQueueFragment on UpgradeQueue {
    id
    acked
    name
    domain
    git
    pingedAt
    provider
  }
`

export const RolloutFragment = gql`
  fragment RolloutFragment on Rollout {
    id
    event
    cursor
    count
    status
    heartbeat
  }
`

export const UpgradeFragment = gql`
  fragment UpgradeFragment on Upgrade {
    id
    message
    repository { ...RepoFragment }
    insertedAt
  }
  ${RepoFragment}
`

export const DeferredUpdateFragment = gql`
  fragment DeferredUpdateFragment on DeferredUpdate {
    id
    dequeueAt
    attempts
    version { version }
    insertedAt
  }
`
