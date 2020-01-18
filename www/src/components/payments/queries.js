import gql from 'graphql-tag'
import { PlanFragment, SubscriptionFragment } from '../../models/payments';

export const CREATE_PLAN = gql`
  mutation CreatePlan($repositoryId: ID!, $attributes: PlanAttributes!) {
    createPlan(repositoryId: $repositoryId, attributes: $attributes) {
      ...PlanFragment
    }
  }
  ${PlanFragment}
`;

export const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription($installationId: ID!, $planId: ID!, $attributes: SubscriptionAttributes!) {
    createSubscription(attributes: $attributes, installationId: $installationId, planId: $planId) {
      ...SubscriptionFragment
    }
  }
  ${SubscriptionFragment}
`;