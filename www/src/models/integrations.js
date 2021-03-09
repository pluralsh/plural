import gql from 'graphql-tag'

export const IntegrationWebhookFragment = gql`
  fragment IntegrationWebhookFragment on IntegrationWebhook {
    id
    name
    url
    secret
    actions
  }
`;

export const WebhookLogFragment = gql`
  fragment WebhookLogFragment on WebhookLog {
    id
    state
    status
    response
    insertedAt
  }
`