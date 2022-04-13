import { gql } from '@apollo/client'

export const AccountFragment = gql`
  fragment AccountFragment on Account {
    id
    name
    billingCustomerId
    backgroundColor
  }
`

export const GroupFragment = gql`
  fragment GroupFragment on Group {
    id
    name
    global
    description
  }
`

export const UserFragment = gql`
  fragment UserFragment on User {
    id
    name
    email
    avatar
    provider
    emailConfirmed
    emailConfirmBy
    backgroundColor
    serviceAccount
    roles { admin }
  }
`

export const ImpersonationPolicy = gql`
  fragment ImpersonationPolicy on ImpersonationPolicy {
    id
    bindings {
      id
      group { id name }
      user { id name email }
    }
  }
`

export const InviteFragment = gql`
  fragment InviteFragment on Invite {
    secureId
    email
  }
`

export const GroupMemberFragment = gql`
  fragment GroupMemberFragment on GroupMember {
    id
    user { ...UserFragment }
  }
  ${UserFragment}
`

export const TokenFragment = gql`
  fragment TokenFragment on PersistedToken {
    id
    token
    insertedAt
  }
`

export const TokenAuditFragment = gql`
  fragment TokenAuditFragment on PersistedTokenAudit {
    ip
    timestamp
    count
    country
    city
    latitude
    longitude
  }
`

export const AddressFragment = gql`
  fragment AddressFragment on Address {
    line1
    line2
    city
    country
    state
    zip
  }
`

export const PublisherFragment = gql`
  fragment PublisherFragment on Publisher {
    id
    name
    phone
    avatar
    description
    backgroundColor
    owner { ...UserFragment }
    address { ...AddressFragment }
  }
  ${UserFragment}
  ${AddressFragment}
`

export const WebhookFragment = gql`
  fragment WebhookFragment on Webhook {
    id
    url
    secret
    insertedAt
  }
`

export const RoleBindingFragment = gql`
  fragment RoleBindingFragment on RoleBinding {
    id
    user { ...UserFragment }
    group { ...GroupFragment }
  }
  ${UserFragment}
  ${GroupFragment}
`

export const RoleFragment = gql`
  fragment RoleFragment on Role {
    id
    name
    description
    repositories
    permissions
    roleBindings { ...RoleBindingFragment }
  }
  ${RoleBindingFragment}
`

export const PublicKeyFragment = gql`
  fragment PublicKeyFragment on PublicKey {
    id
    name
    digest
    insertedAt
  }
`

export const EabCredentialFragment = gql`
  fragment EabCredentialFragment on EabCredential {
    id
    keyId
    hmacKey
    cluster
    provider
    insertedAt
  }
`
