import { gql } from '@apollo/client'

import { NotificationFragment } from '../../models/incidents'
import { PageInfo } from '../../models/misc'

export const NOTIFICATIONS_QUERY = gql`
  query NotificationsQuery($incidentId: ID, $first: Int = 50, $cursor: String) {
    notifications(incidentId: $incidentId, first: $first, after: $cursor) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...NotificationFragment
        }
      }
    }
  }
  ${PageInfo}
  ${NotificationFragment}
`
