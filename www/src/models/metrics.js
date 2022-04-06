import gql from 'graphql-tag'

export const MetricFragment = gql`
  fragment MetricFragment on Metric {
    name
    tags { name value }
    values { time value }
  }
`
