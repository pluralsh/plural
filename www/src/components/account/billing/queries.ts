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
      availableFeatures {
        userManagement
        audit
      }
      subscription {
        id
        plan {
          id
          period
          lineItems {
            dimension
            cost
          }
          name
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
