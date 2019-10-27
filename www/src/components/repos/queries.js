import gql from 'graphql-tag'
import {RepoFragment} from '../../models/repo'
import {ChartFragment} from '../../models/chart'

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

export const REPO_Q = gql`
  query Repo($repositoryId: String!, $chartCursor: String) {
    repositor
    charts(repositoryId: $repositoryId, first: 15, after: $chartCursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...ChartFragment
        }
      }
    }
  }
  ${ChartFragment}
`;