import { gql } from '@apollo/client'

export const PageInfo = gql`
  fragment PageInfo on PageInfo {
    endCursor
    hasNextPage
  }
`
