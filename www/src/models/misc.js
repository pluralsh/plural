import gql from 'graphql-tag'

export const PageInfo = gql`
  fragment PageInfo on PageInfo {
    endCursor
    hasNextPage
  }
`