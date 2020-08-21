import gql from 'graphql-tag'
import {DependenciesFragment} from './repo'

export const ChartFragment = gql`
  fragment ChartFragment on Chart {
    id
    name
    description
    latestVersion
    dependencies {
      ...DependenciesFragment
    }
  }
  ${DependenciesFragment}
`;

export const VersionTagFragment = gql`
  fragment VersionTagFragment on VersionTag {
    id
    tag
    version {
      id
    }
  }
`;

export const VersionFragment = gql`
  fragment VersionFragment on Version {
    id
    helm
    readme
    valuesTemplate
    version
    insertedAt
    chart {
      ...ChartFragment
    }
  }
  ${ChartFragment}
`;

export const ChartInstallationFragment = gql`
  fragment ChartInstallationFragment on ChartInstallation {
    id
    version {
      id
      version
    }
  }
`;