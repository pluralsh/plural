import { gql } from '@apollo/client'

export const CARDS_QUERY = gql`
  query Cards {
    me {
      cards(first: 100) {
        edges {
          node {
            id
            name
            brand
            expMonth
            expYear
            last4
          }
        }
      }
    }
  }
`
