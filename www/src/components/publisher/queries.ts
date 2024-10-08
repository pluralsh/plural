import { gql } from '@apollo/client'

import { PublisherFragment } from '../../models/user'

export const PUBLISHER_QUERY = gql`
  query Publisher($publisherId: ID) {
    publisher(id: $publisherId) {
      ...PublisherFragment
    }
  }
  ${PublisherFragment}
`

export const CREATE_PUBLISHER_MUTATION = gql`
  mutation CreatePublisher($attributes: PublisherAttributes!) {
    createPublisher(attributes: $attributes) {
      ...PublisherFragment
    }
  }
  ${PublisherFragment}
`
