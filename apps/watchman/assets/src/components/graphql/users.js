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

export const USERS_Q = gql`
  query Users($cursor: String) {
    users(first: 20, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...UserFragment
        }
      }
    }
  }
  ${UserFragment}
`;

export const INVITE_USER = gql`
  mutation InviteUser($email: String) {
    createInvite(attributes: {email: $email}) {
      secureId
    }
  }
`;

export const INVITE_Q = gql`
  query Invite($id: String!) {
    invite(id: $id) {
      email
    }
  }
`;

export const SIGNUP = gql`
  mutation SignUp($inviteId: String!, $attributes: UserAttributes!) {
    signup(inviteId: $inviteId, attributes: $attributes) {
      ...UserFragment
      jwt
    }
  }
  ${UserFragment}
`;