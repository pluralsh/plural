import { gql } from '@apollo/client'

import { NotificationFragment } from '../../models/incidents'
import { PageInfo } from '../../models/misc'

export const NOTIFICATIONS_QUERY = gql`
  query NotificationsQuery($incidentId: ID, $cursor: String) {
    notifications(incidentId: $incidentId, first: 50, after: $cursor) {
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
