import gql from 'graphql-tag'

export const ChartFragment = gql`
  fragment ChartFragment on Chart {
    id
    name
    latestVersion
  }
`;

export const VersionFragment = gql`
  fragment VersionFragment on Version {
    helm
    version
    chart {
      ...ChartFragment
    }
  }
  ${ChartFragment}
`;