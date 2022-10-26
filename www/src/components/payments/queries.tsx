import { gql } from '@apollo/client'

import { InvoiceFragment, PlanFragment, SubscriptionFragment } from '../../models/payments'
import { InstallationFragment } from '../../models/repo'

export const CREATE_PLAN = gql`
  mutation CreatePlan($repositoryId: ID!, $attributes: PlanAttributes!) {
    createPlan(repositoryId: $repositoryId, attributes: $attributes) {
      ...PlanFragment
    }
  }
  ${PlanFragment}
`

export const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription($installationId: ID!, $planId: ID!, $attributes: SubscriptionAttributes!) {
    createSubscription(attributes: $attributes, installationId: $installationId, planId: $planId) {
      ...SubscriptionFragment
    }
  }
  ${SubscriptionFragment}
`

export const UPDATE_LINE_ITEM = gql`
  mutation UpdateLineItem($subscriptionId: ID!, $attributes: LimitAttributes!) {
    updateLineItem(subscriptionId: $subscriptionId, attributes: $attributes) {
      ...SubscriptionFragment
    }
  }
  ${SubscriptionFragment}
`

export const UPDATE_PLAN = gql`
  mutation UpdatePlan($subscriptionId: ID!, $planId: ID!) {
    updatePlan(subscriptionId: $subscriptionId, planId: $planId) {
      ...SubscriptionFragment
    }
  }
  ${SubscriptionFragment}

`

export const SUBSCRIPTIONS_Q = gql`
  query Subscriptions($cursor: String) {
    subscriptions(first: 15, after: $cursor) {
      edges {
        node {
          ...SubscriptionFragment
          installation { ...InstallationFragment }
        }
      }
    }
  }
  ${SubscriptionFragment}
  ${InstallationFragment}
`

export const SUBSCRIPTION_Q = gql`
  query Subscription($id: ID!) {
    repositorySubscription(id: $id) {
      id
      installation { ...InstallationFragment }
      invoices(first: 15) {
        edges {
          node { ...InvoiceFragment }
        }
      }
    }
  }
  ${InstallationFragment}
  ${InvoiceFragment}
`

export const UPDATE_PLAN_ATTRS = gql`
  mutation Update($id: ID!, $attributes: UpdatablePlanAttributes!) {
    updatePlanAttributes(id: $id, attributes: $attributes) { ...PlanFragment }
  }
  ${PlanFragment}
`
