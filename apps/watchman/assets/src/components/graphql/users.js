import { gql } from 'apollo-boost'

export const UserFragment = gql`
  fragment UserFragment on User {
    id
    name
    email
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
  mutation SignIn($email: String!, $password: String!) {
    SignIn(email: $email, password: $password) {
      ...UserFragment
      jwt
    }
  }
  ${UserFragment}
`;