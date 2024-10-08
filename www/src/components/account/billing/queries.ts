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
      trial
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

export const DOWNGRADE_TO_FREE_PLAN_MUTATION = gql`
  mutation DowngradeToFreePlanMutation {
    deletePlatformSubscription {
      id
    }
  }
`
