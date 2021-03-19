import gql from 'graphql-tag'

export const DockerRepoFragment = gql`
  fragment DockerRepoFragment on DockerRepository {
    id
    name
    repository { id name }
    insertedAt
    updatedAt
  }
`;

export const DockerImageFragment = gql`
  fragment DockerImageFragment on DockerImage {
    id
    tag
    digest
    scannedAt
    grade
    dockerRepository {
      ...DockerRepoFragment
    }
    insertedAt
  }
  ${DockerRepoFragment}
`;

export const VulnerabilityFragment = gql`
  fragment VulnerabilityFragment on Vulnerability {
    id
    title
    description
    vulnerabilityId
    package
    installedVersion
    fixedVersion
    source
    url
    severity
    score
    cvss { attackVector attackComplexity privilegesRequired userInteraction confidentiality integrity availability }
    layer { digest diffId }
  }
`