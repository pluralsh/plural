import { gql } from '@apollo/client'

import { VersionFragment, VersionTagFragment } from '../../models/chart'

export const UPDATE_VERSION = gql`
  mutation UpdateVersion($id: ID!, $attributes: VersionAttributes!) {
    updateVersion(id: $id, attributes: $attributes) {
      ...VersionFragment
      tags { ...VersionTagFragment }
    }
  }
  ${VersionFragment}
  ${VersionTagFragment}
`
