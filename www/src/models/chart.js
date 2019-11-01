import gql from 'graphql-tag'

export const ChartFragment = gql`
  fragment ChartFragment on Chart {
    id
    name
    description
    latestVersion
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