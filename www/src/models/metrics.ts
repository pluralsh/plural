import { gql } from '@apollo/client'

export const MetricFragment = gql`
  fragment MetricFragment on Metric {
    name
    tags { name value }
    values { time value }
  }
`
