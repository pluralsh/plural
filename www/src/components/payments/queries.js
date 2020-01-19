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

export const UPDATE_LINE_ITEM = gql`
  mutation UpdateLineItem($subscriptionId: ID!, $attributes: LimitAttributes!) {
    updateLineItem(subscriptionId: $subscriptionId, attributes: $attributes) {
      ...SubscriptionFragment
    }
  }
  ${SubscriptionFragment}
`;

export const UPDATE_PLAN = gql`
  mutation UpdatePlan($subscriptionId: ID!, $planId: ID!) {
    updatePlan(subscriptionId: $subscriptionId, planId: $planId) {
      ...SubscriptionFragment
    }
  }
  ${SubscriptionFragment}
  
`;