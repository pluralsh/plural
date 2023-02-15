import { useApolloClient, useSubscription } from '@apollo/client'

import { appendConnection, updateCache, updateFragment } from '../utils/graphql'
import { IncidentFragment } from '../models/incidents'
import { NOTIFICATIONS_Q, NOTIF_SUB } from '../utils/queries'

export function useNotificationSubscription() {
  const client = useApolloClient()

  useSubscription(NOTIF_SUB, {
    onSubscriptionData: ({ subscriptionData: { data: { notification } } }) => {
      const { incident: { id } } = notification

      try {
        updateCache(client, {
          query: NOTIFICATIONS_Q,
          variables: { incidentId: id },
          update: prev => appendConnection(prev, notification, 'notifications'),
        })
      }
      catch (error) {
        //
      }

      try {
        updateCache(client, {
          query: NOTIFICATIONS_Q,
          variables: {},
          update: prev => appendConnection(prev, notification, 'notifications'),
        })
      }
      catch (error) {
        //
      }

      updateFragment(client, {
        id: `Incident:${id}`,
        fragment: IncidentFragment,
        fragmentName: 'IncidentFragment',
        update: ({ notificationCount, ...rest }) => ({ ...rest, notificationCount: notificationCount + 1 }),
      })
    },
  })
}
