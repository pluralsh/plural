import gql from 'graphql-tag'
import {UserFragment} from '../../models/user'

export const ME_Q = gql`
  query {
    me {
      ...UserFragment
    }
  }
  ${UserFragment}
`;