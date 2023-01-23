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

export const CREATE_CARD_MUTATION = gql`
  mutation CreateCard($source: String!) {
    createCard(source: $source) {
      id
    }
  }
`

export const DELETE_CARD_MUTATION = gql`
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id) {
      id
    }
  }
`

export const CLUSTERS_QUERY = gql`
  query Clusters {
    clusters(first: 500) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`

export const USERS_QUERY = gql`
  query Users {
    users(serviceAccount: false, first: 500) {
      edges {
        node {
          id
        }
      }
    }
  }
`
