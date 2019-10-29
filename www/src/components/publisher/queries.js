import gql from 'graphql-tag'
import {PublisherFragment} from '../../models/user'

export const PUBLISHERS_Q = gql`
  query Publishers($cursor: String) {
    publishers(first: 15, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...PublisherFragment
        }
      }
    }
  }
  ${PublisherFragment}
`;

export const PUBLISHER_Q = gql`
  query Publisher($publisherId: ID) {
    publisher(id: $publisherId) {
      ...PublisherFragment
    }
  }
  ${PublisherFragment}
`;