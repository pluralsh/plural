import { gql } from 'apollo-boost'
import { AccountFragment } from '../../models/user';

export const UPDATE_ACCOUNT = gql`
  mutation UpdateAccount($attributes: AccountAttributes!) {
    updateAccount(attributes: $attributes) {
      ...AccountFragment
    }
  }
  ${AccountFragment}
`;