import { gql } from '@apollo/client'

import { AuditFragment, DnsDomainFragment, DnsRecordFragment, InviteFragment, OidcLoginFragment } from '../../models/account'
import { PageInfo } from '../../models/misc'
import { AccountFragment, GroupFragment, GroupMemberFragment, ImpersonationPolicy, RoleFragment, UserFragment } from '../../models/user'

export const UPDATE_ACCOUNT = gql`
  mutation UpdateAccount($attributes: AccountAttributes!) {
    updateAccount(attributes: $attributes) {
      ...AccountFragment
    }
  }
  ${AccountFragment}
`

export const USERS_Q = gql`
  query Users($q: String, $serviceAccount: Boolean, $all: Boolean, $cursor: String) {
    users(q: $q, first: 20, after: $cursor, serviceAccount: $serviceAccount, all: $all) {
      pageInfo { ...PageInfo }
      edges {
        node { ...UserFragment
          impersonationPolicy { ...ImpersonationPolicy }
        }
      }
    }
  }
  ${PageInfo}
  ${UserFragment}
  ${ImpersonationPolicy}
`

export const GROUPS_Q = gql`
  query Groups($q: String, $cursor: String) {
    groups(q: $q, first: 20, after: $cursor) {
      pageInfo { ...PageInfo }
      edges {
        node { ...GroupFragment }
      }
    }
  }
  ${PageInfo}
  ${GroupFragment}
`

export const SEARCH_USERS = gql`
  query SearchUsers($q: String, $cursor: String) {
    users(q: $q, after: $cursor, first: 5, all: true) {
      pageInfo { ...PageInfo }
      edges {
        node { ...UserFragment }
      }
    }
  }
  ${PageInfo}
  ${UserFragment}
`

export const SEARCH_GROUPS = gql`
  query SearchGroups($q: String, $cursor: String) {
    groups(q: $q, after: $cursor, first: 5) {
      pageInfo { ...PageInfo }
      edges {
        node { ...GroupFragment }
      }
    }
  }
  ${PageInfo}
  ${GroupFragment}
`

export const GROUP_MEMBERS = gql`
  query GroupMembers($cursor: String, $id: ID!) {
    groupMembers(groupId: $id, after: $cursor, first: 20) {
      pageInfo { ...PageInfo }
      edges {
        node { ...GroupMemberFragment }
      }
    }
  }
  ${PageInfo}
  ${GroupMemberFragment}
`

export const CREATE_GROUP_MEMBERS = gql`
  mutation CreateGroupMember($groupId: ID!, $userId: ID!) {
    createGroupMember(groupId: $groupId, userId: $userId) {
      ...GroupMemberFragment
    }
  }
  ${GroupMemberFragment}
`

export const DELETE_GROUP_MEMBER = gql`
  mutation DeleteMember($groupId: ID!, $userId: ID!) {
    deleteGroupMember(groupId: $groupId, userId: $userId) {
      ...GroupMemberFragment
    }
  }
  ${GroupMemberFragment}
`

export const EDIT_USER = gql`
  mutation UpdateUser($id: ID, $attributes: UserAttributes!) {
    updateUser(id: $id, attributes: $attributes) {
      ...UserFragment
    }
  }
  ${UserFragment}
`

export const CREATE_GROUP = gql`
  mutation CreateGroup($attributes: GroupAttributes!) {
    createGroup(attributes: $attributes) {
      ...GroupFragment
    }
  }
  ${GroupFragment}
`

export const UPDATE_GROUP = gql`
  mutation UpdateGroup($id: ID!, $attributes: GroupAttributes!) {
    updateGroup(groupId: $id, attributes: $attributes) {
      ...GroupFragment
    }
  }
  ${GroupFragment}
`

export const DELETE_GROUP = gql`
  mutation DeleteGroup($id: ID!) {
    deleteGroup(groupId: $id) {
      ...GroupFragment
    }
  }
  ${GroupFragment}
`

export const CREATE_INVITE = gql`
  mutation CreateInvite($attributes: InviteAttributes!) {
    createInvite(attributes: $attributes) {
      ...InviteFragment
    }
  }
  ${InviteFragment}
`

export const CREATE_ROLE = gql`
  mutation CreateRole($attributes: RoleAttributes!) {
    createRole(attributes: $attributes) {
      ...RoleFragment
    }
  }
  ${RoleFragment}
`

export const UPDATE_ROLE = gql`
  mutation UpdateRole($id: ID!, $attributes: RoleAttributes!) {
    updateRole(id: $id, attributes: $attributes) {
      ...RoleFragment
    }
  }
  ${RoleFragment}
`

export const DELETE_ROLE = gql`
  mutation DeleteRow($id: ID!) {
    deleteRole(id: $id) {
      ...RoleFragment
    }
  }
  ${RoleFragment}
`

export const CREATE_SERVICE_ACCOUNT = gql`
  mutation Create($attributes: ServiceAccountAttributes!) {
    createServiceAccount(attributes: $attributes) {
      ...UserFragment
      impersonationPolicy { ...ImpersonationPolicy }
    }
  }
  ${ImpersonationPolicy}
  ${UserFragment}
`

export const UPDATE_SERVICE_ACCOUNT = gql`
  mutation Create($id: ID!, $attributes: ServiceAccountAttributes!) {
    updateServiceAccount(id: $id, attributes: $attributes) {
      ...UserFragment
      impersonationPolicy { ...ImpersonationPolicy }
    }
  }
  ${ImpersonationPolicy}
  ${UserFragment}
`

export const ROLES_Q = gql`
  query Roles($cursor: String, $q: String) {
    roles(first: 20, after: $cursor, q: $q) {
      pageInfo { ...PageInfo }
      edges { node { ...RoleFragment } }
    }
  }
  ${PageInfo}
  ${RoleFragment}
`

export const AUDITS_Q = gql`
  query Audits($cursor: String) {
    audits(first: 50, after: $cursor) {
      pageInfo { ...PageInfo }
      edges { node { ...AuditFragment } }
    }
  }
  ${PageInfo}
  ${AuditFragment}
`

export const LOGINS_Q = gql`
  query Logins($cursor: String) {
    oidcLogins(first: 50, after: $cursor) {
      pageInfo { ...PageInfo }
      edges { node { ...OidcLoginFragment } }
    }
  }
  ${PageInfo}
  ${OidcLoginFragment}
`

export const AUDIT_METRICS = gql`
  query {
    auditMetrics { country count }
  }
`

export const LOGIN_METRICS = gql`
  query {
    loginMetrics { country count }
  }
`

export const IMPERSONATE_SERVICE_ACCOUNT = gql`
  mutation Impersonate($id: ID) {
    impersonateServiceAccount(id: $id) { jwt }
  }
`

export const DNS_DOMAINS = gql`
  query Domains($cursor: String) {
    dnsDomains(after: $cursor, first: 50) {
      pageInfo { ...PageInfo }
      edges { node { ...DnsDomainFragment } }
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
        pageInfo { ...PageInfo }
        edges { node { ...DnsRecordFragment } }
      }
    }
  }
  ${PageInfo}
  ${DnsRecordFragment}
`

export const CREATE_DOMAIN = gql`
  mutation Create($attributes: DnsDomainAttributes!) {
    createDomain(attributes: $attributes) {
      ...DnsDomainFragment
    }
  }
  ${DnsDomainFragment}
`

export const UPDATE_DOMAIN = gql`
  mutation Update($id: ID!, $attributes: DnsDomainAttributes!) {
    updateDomain(id: $id, attributes: $attributes) {
      ...DnsDomainFragment
    }
  }
  ${DnsDomainFragment}
`

export const DELETE_DOMAIN = gql`
  mutation Delete($id: ID!) {
    deleteDomain(id: $id) { ...DnsDomainFragment }
  }
  ${DnsDomainFragment}
`

export const DELETE_DNS_RECORD = gql`
  mutation Delete($name: String!, $type: DnsRecordType!) {
    deleteDnsRecord(name: $name, type: $type) {
      ...DnsRecordFragment
    }
  }
  ${DnsRecordFragment}
`

export const INVITES_Q = gql`
  query Invites($cursor: String) {
    invites(first: 50, after: $cursor) {
      pageInfo { ...PageInfo }
      edges { node { ...InviteFragment } }
    }
  }
  ${PageInfo}
  ${InviteFragment}
`

export const DELETE_INVITE = gql`
  mutation Delete($id: String!) {
    deleteInvite(secureId: $id) { ...InviteFragment }
  }
  ${InviteFragment}
`
