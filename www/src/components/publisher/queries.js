import { gql } from '@apollo/client'

import { PageInfo } from '../../models/misc'
import { PublisherFragment } from '../../models/user'

export const PUBLISHERS_Q = gql`
  query Publishers($cursor: String) {
    publishers(first: 15, after: $cursor) {
      pageInfo { ...PageInfo }
      edges {
        node {
          ...PublisherFragment
          repositories {
            id
            name
            description
            documentation
            icon
          }
        }
      }
    }
  }
  ${PublisherFragment}
  ${PageInfo}
`

export const ACCOUNT_PUBLISHERS = gql`
  query AccountPubs($cursor: String) {
    publishers(first: 50, after: $cursor, publishable: true) {
      pageInfo { ...PageInfo }
      edges { node { ...PublisherFragment } }
    }
  }
  ${PageInfo}
  ${PublisherFragment}
`

export const PUBLISHER_Q = gql`
  query Publisher($publisherId: ID) {
    publisher(id: $publisherId) {
      ...PublisherFragment
    }
  }
  ${PublisherFragment}
`

export const FULL_PUBLISHER_Q = gql`
  query Publisher($id: ID) {
    publisher(id: $id) {
      ...PublisherFragment
      billingAccountId
    }
  }
  ${PublisherFragment}
`

export const EDIT_PUBLISHER = gql`
  mutation EditPublisher($attributes: PublisherAttributes!) {
    updatePublisher(attributes: $attributes) {
      ...PublisherFragment
    }
  }
  ${PublisherFragment}
`

export const CREATE_PUBLISHER = gql`
  mutation CreatePublisher($attributes: PublisherAttributes!) {
    createPublisher(attributes: $attributes) {
      ...PublisherFragment
    }
  }
  ${PublisherFragment}
`

export const LINK_ACCOUNT = gql`
  mutation LinkPublisher($token: String!) {
    linkPublisher(token: $token) {
      ...PublisherFragment
      billingAccountId
    }
  }
  ${PublisherFragment}
`
