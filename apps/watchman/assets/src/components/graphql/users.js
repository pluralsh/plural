import { gql } from 'apollo-boost'

export const UserFragment = gql`
  fragment UserFragment on User {
    id
    name
    email
    backgroundColor
  }
`;

export const ME_Q = gql`
  query {
    me {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const SIGNIN = gql`
  mutation signIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      ...UserFragment
      jwt
    }
  }
  ${UserFragment}
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($attributes: UserAttributes!) {
    updateUser(attributes: $attributes) {
      ...UserFragment
    }
  }
  ${UserFragment}
`;