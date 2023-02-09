import { gql } from '@apollo/client'

export const PLATFORM_PLANS_QUERY = gql`
  query PlatformPlans {
    platformPlans {
      id
      name
      cost
      period
      visible
      enterprise
      features {
        vpn
      }
      lineItems {
        name
        dimension
        cost
        period
      }
    }
  }
`

export const SUBSCRIPTION_QUERY = gql`
  query Subscription {
    account {
      billingCustomerId
      grandfatheredUntil
      delinquentAt
      userCount
      clusterCount
      availableFeatures { userManagement audit }
      subscription {
        id
        plan {
          id
        }
      }
      billingAddress {
        name
        line1
        line2
        zip
        state
        city
        country
      }
    }
  }
`

export const UPDATE_ACCOUNT_BILLING_MUTATION = gql`
  mutation UpdateAccountBilling($attributes: AccountAttributes!) {
    updateAccount(attributes: $attributes) {
      id
    }
  }
`

export const UPGRADE_TO_PROFESSIONAL_PLAN_MUTATION = gql`
  mutation UpgradeToProfessionalPlan($planId: ID!) {
    createPlatformSubscription(planId: $planId) {
      id
    }
  }
`

export const DOWNGRADE_TO_FREE_PLAN_MUTATION = gql`
  mutation DowngradeToFreePlanMutation {
    deletePlatformSubscription {
      id
    }
  }
`

export const CARDS_QUERY = gql`
  query Cards {
    me {
      id
      cards(first: 100) {
        edges {
          node {
            id
            name
            brand
            expMonth
            expYear
            last4
          }
        }
      }
    }
  }
`

export const CREATE_CARD_MUTATION = gql`
  mutation CreateCard($source: String!) {
    createCard(source: $source) {
      id
    }
  }
`

export const DELETE_CARD_MUTATION = gql`
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id) {
      id
    }
  }
`

export const INVOICES_QUERY = gql`
  query Users {
    invoices(first: 500) {
      edges {
        node {
          number
          amountPaid
          hostedInvoiceUrl
          createdAt
        }
      }
    }
  }
`
