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
      grandfatheredUntil
      delinquentAt
      subscription {
        id
        plan {
          id
        }
      }
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
