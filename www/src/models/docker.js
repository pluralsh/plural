import gql from 'graphql-tag'

export const DockerRepoFragment = gql`
  fragment DockerRepoFragment on DockerRepository {
    id
    name
    insertedAt
    updatedAt
  }
`;

export const DockerImageFragment = gql`
  fragment DockerImageFragment on DockerImage {
    id
    tag
    digest
    dockerRepository {
      ...DockerRepoFragment
    }
    insertedAt
  }
  ${DockerRepoFragment}
`;