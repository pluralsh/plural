import { gql } from '@apollo/client'

import { AuditFragment, OidcLoginFragment } from '../../models/account'
import { PageInfo } from '../../models/misc'

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
