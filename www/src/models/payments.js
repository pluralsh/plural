import { gql } from '@apollo/client'

export const LimitFragment = gql`
  fragment LimitFragment on Limit {
    dimension
    quantity
  }
`

export const LineItem = gql`
  fragment LineItem on LineItem {
    name
    dimension
    cost
    period
    type
  }
`

export const ServiceLevel = gql`
  fragment ServiceLevel on ServiceLevel {
    minSeverity
    maxSeverity
    responseTime
  }
`

export const PlanFragment = gql`
  fragment PlanFragment on Plan {
    id
    name
    cost
    period
    serviceLevels { ...ServiceLevel }
    lineItems {
      included { ...LimitFragment }
      items { ...LineItem }
    }
    metadata { features { name description } }
  }
  ${LimitFragment}
  ${LineItem}
  ${ServiceLevel}
`

export const SubscriptionFragment = gql`
  fragment SubscriptionFragment on RepositorySubscription {
    id
    plan { ...PlanFragment }
    lineItems { items { ...LimitFragment } }
  }
  ${PlanFragment}
  ${LimitFragment}
`

export const InvoiceItemFragment = gql`
  fragment InvoiceItemFragment on InvoiceItem {
    amount
    currency
    description
  }
`

export const InvoiceFragment = gql`
  fragment InvoiceFragment on Invoice {
    number
    amountDue
    amountPaid
    currency
    status
    createdAt
    hostedInvoiceUrl
    lines { ...InvoiceItemFragment }
  }
  ${InvoiceItemFragment}
`

export const CardFragment = gql`
  fragment CardFragment on Card {
    id
    last4
    expMonth
    expYear
    name
    brand
  }
`
