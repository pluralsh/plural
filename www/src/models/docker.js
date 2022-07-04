import { gql } from '@apollo/client'

export const DockerRepoFragment = gql`
  fragment DockerRepoFragment on DockerRepository {
    id
    name
    public
    repository { id name }
    insertedAt
    updatedAt
  }
`

export const DockerRepository = gql`
  fragment DockerRepository on DockerRepository {
    id
    name
    public
    repository { id name editable }
    insertedAt
    updatedAt
  }
`

export const DockerImageFragment = gql`
  fragment DockerImageFragment on DockerImage {
    id
    tag
    digest
    scannedAt
    grade
    insertedAt
  }
`

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
