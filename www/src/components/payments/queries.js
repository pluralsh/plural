import gql from 'graphql-tag'
import { PlanFragment } from '../../models/payments';

export const CREATE_PLAN = gql`
  mutation CreatePlan($repositoryId: ID!, $attributes: PlanAttributes!) {
    createPlan(repositoryId: $repositoryId, attributes: $attributes) {
      ...PlanFragment
    }
  }
  ${PlanFragment}
`;