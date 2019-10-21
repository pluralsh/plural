import gql from 'graphql-tag'
import {RepoFragment} from '../../models/repo'

export const CREATE_REPO = gql`
  mutation CreateRepository($attributes: RepositoryAttributes!) {
    createRepository(attributes: $attributes) {
      ...RepoFragment
    }
  }
  ${RepoFragment}
`;

export const REPOS_Q = gql`
  query Repos($publisherId: String, $cursor: String) {
    repositories(publisherId: $publisherId, first: 15, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...RepoFragment
        }
      }
    }
  }
  ${RepoFragment}
`;