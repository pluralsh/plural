import gql from 'graphql-tag'
import {UserFragment} from './user'

export const RepoFragment = gql`
  fragment RepoFragment on Repository {
    id
    name
  }
`;

export const InstallationFragment = gql`
  fragment InstallationFragment on Installation {
    repository {
      ...RepoFragment
    }
    user {
      ...UserFragment
    }
  }
  ${RepoFragment}
  ${UserFragment}
`;