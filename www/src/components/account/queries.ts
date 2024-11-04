import { gql } from '@apollo/client'

import {
  AuditFragment,
  DnsDomainFragment,
  DnsRecordFragment,
  InviteFragment,
} from '../../models/account'
import { PageInfo } from '../../models/misc'
import {
  GroupFragment,
  ImpersonationPolicy,
  RoleFragment,
  UserFragment,
} from '../../models/user'

export const USERS_Q = gql`
  query Users(
    $q: String
    $serviceAccount: Boolean
    $all: Boolean
    $cursor: String
    $first: Int = 20
  ) {
    users(
      q: $q
      first: $first
      after: $cursor
      serviceAccount: $serviceAccount
      all: $all
    ) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...UserFragment
          impersonationPolicy {
            ...ImpersonationPolicy
          }
        }
      }
    }
  }
  ${PageInfo}
  ${UserFragment}
  ${ImpersonationPolicy}
`

export const SEARCH_USERS = gql`
  query SearchUsers($q: String, $cursor: String) {
    users(q: $q, after: $cursor, first: 5, all: true) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...UserFragment
        }
      }
    }
  }
  ${PageInfo}
  ${UserFragment}
`

export const SEARCH_GROUPS = gql`
  query SearchGroups($q: String, $cursor: String) {
    groups(q: $q, after: $cursor, first: 5) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...GroupFragment
        }
      }
    }
  }
  ${PageInfo}
  ${GroupFragment}
`

export const UPDATE_SERVICE_ACCOUNT = gql`
  mutation Create($id: ID!, $attributes: ServiceAccountAttributes!) {
    updateServiceAccount(id: $id, attributes: $attributes) {
      ...UserFragment
      impersonationPolicy {
        ...ImpersonationPolicy
      }
    }
  }
  ${ImpersonationPolicy}
  ${UserFragment}
`

export const ROLES_Q = gql`
  query Roles($cursor: String, $q: String) {
    roles(first: 20, after: $cursor, q: $q) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...RoleFragment
        }
      }
    }
  }
  ${PageInfo}
  ${RoleFragment}
`

export const DNS_DOMAINS = gql`
  query Domains($cursor: String) {
    dnsDomains(after: $cursor, first: 50) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...DnsDomainFragment
        }
      }
    }
  }
  ${PageInfo}
  ${DnsDomainFragment}
`

export const DNS_RECORDS = gql`
  query Records($id: ID!, $cursor: String) {
    dnsDomain(id: $id) {
      id
      name
      dnsRecords(after: $cursor, first: 50) {
        pageInfo {
          ...PageInfo
        }
        edges {
          node {
            ...DnsRecordFragment
          }
        }
      }
    }
  }
  ${PageInfo}
  ${DnsRecordFragment}
`

export const INVITES_Q = gql`
  query Invites($cursor: String) {
    invites(first: 50, after: $cursor) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...InviteFragment
        }
      }
    }
  }
  ${PageInfo}
  ${InviteFragment}
`
