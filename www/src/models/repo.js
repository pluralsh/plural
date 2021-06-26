import gql from 'graphql-tag'
import { UserFragment, PublisherFragment } from './user'

export const CategoryFragment = gql`
  fragment CategoryFragment on CategoryInfo {
    category
    count
  }
`

export const RepoFragment = gql`
  fragment RepoFragment on Repository {
    id
    name
    description
    documentation
    icon
    private
    category
    publisher { ...PublisherFragment }
  }
  ${PublisherFragment}
`;

export const InstallationFragment = gql`
  fragment InstallationFragment on Installation {
    id
    context
    license
    autoUpgrade
    trackTag
    repository { ...RepoFragment }
    user { ...UserFragment }
  }
  ${RepoFragment}
  ${UserFragment}
`;

export const DependenciesFragment = gql`
  fragment DependenciesFragment on Dependencies {
    dependencies {
      name
      repo
      type
      version
      optional
    }
    providers
    application
    wirings { terraform helm }
  }
`;

export const IntegrationFragment = gql`
  fragment IntegrationFragment on Integration {
    id
    name
    icon
    sourceUrl
    description
    tags { tag }
    publisher { ...PublisherFragment }
  }
  ${PublisherFragment}
`;

export const ArtifactFragment = gql`
  fragment ArtifactFragment on Artifact {
    id
    name
    blob
    type
    platform
    filesize
    sha
    readme
  }
`;