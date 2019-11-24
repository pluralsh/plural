import gql from 'graphql-tag'
import {UserFragment, TokenFragment} from '../../models/user'

export const ME_Q = gql`
  query {
    me {
      ...UserFragment
      publisher {
        id
        name
        description
      }
    }
  }
  ${UserFragment}
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($attributes: UserAttributes!) {
    updateUser(attributes: $attributes) {
      ...UserFragment
    }
    ${UserFragment}
  }
  ${UserFragment}
`;

export const TOKENS_Q = gql`
  query Tokens($cursor: String) {
    tokens(after: $cursor, first: 10) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...TokenFragment
        }
      }
    }
  }
  ${TokenFragment}
`;

export const CREATE_TOKEN = gql`
  mutation {
    createToken {
      ...TokenFragment
    }
  }
  ${TokenFragment}
`;