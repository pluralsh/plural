import gql from 'graphql-tag'
import {UserFragment} from './user'

export const RepoFragment = gql`
  fragment RepoFragment on Repository {
    id
    name
    description
    documentation
    icon
  }
`;

export const InstallationFragment = gql`
  fragment InstallationFragment on Installation {
    id
    context
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