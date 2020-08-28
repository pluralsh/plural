import { gql } from 'apollo-boost'

export const BuildFragment = gql`
  fragment BuildFragment on Build {
    id
    repository
    type
    status
    message
    insertedAt
    completedAt
  }
`;

export const CommandFragment = gql`
  fragment CommandFragment on Command {
    id
    command
    exitCode
    stdout
    completedAt
    insertedAt
  }
`;

export const BUILDS_Q = gql`
  query Builds($cursor: String) {
    builds(first: 15, after: $cursor) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...BuildFragment
        }
      }
    }
  }
  ${BuildFragment}
`;

export const BUILD_Q = gql`
  query Build($buildId: ID!) {
    build(id: $buildId) {
      ...BuildFragment
      commands(first: 100) {
        edges {
          node {
            ...CommandFragment
          }
        }
      }
    }
  }
  ${BuildFragment}
  ${CommandFragment}
`;

export const CREATE_BUILD = gql`
  mutation CreateBuild($attributes: BuildAttributes!) {
    createBuild(attributes: $attributes) {
      ...BuildFragment
    }
  }
  ${BuildFragment}
`;

export const CANCEL_BUILD = gql`
  mutation CancelBuild($id: ID!) {
    cancelBuild(id: $id) {
      ...BuildFragment
    }
  }
  ${BuildFragment}
`;

export const BUILD_SUB = gql`
  subscription BuildSub($buildId: String) {
    buildDelta(buildId: $buildId) {
      delta
      payload {
        ...BuildFragment
      }
    }
  }
  ${BuildFragment}
`;

export const COMMAND_SUB = gql`
  subscription CommandSubs($buildId: ID!) {
    commandDelta(buildId: $buildId) {
      delta
      payload {
        ...CommandFragment
      }
    }
  }
  ${CommandFragment}
`;