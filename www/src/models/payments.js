import gql from 'graphql-tag'

export const LimitFragment = gql`
  fragment LimitFragment on Limit {
    dimension
    quantity
  }
`;

export const PlanFragment = gql`
  fragment PlanFragment on Plan {
    id
    name
    cost
    period
    lineItems {
      included {
        ...LimitFragment
      }
      items {
        name
        dimension
        cost
        period
      }
    }
    metadata {
      features {
        name
        description
      }
    }
  }
  ${LimitFragment}
`;

export const SubscriptionFragment = gql`
  fragment SubscriptionFragment on RepositorySubscription {
    id
    plan {
      ...PlanFragment
    }
    lineItems {
      items {
        ...LimitFragment
      }
    }
  }
  ${PlanFragment}
  ${LimitFragment}
`;