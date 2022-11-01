import { gql } from '@apollo/client'

import { IntegrationWebhookFragment, OauthIntegration, WebhookLogFragment } from '../../models/integrations'
import { PageInfo } from '../../models/misc'

export const WEBHOOKS_Q = gql`
  query Webhooks($cursor: String) {
    integrationWebhooks(first: 50, after: $cursor) {
      pageInfo { ...PageInfo }
      edges { node { ...IntegrationWebhookFragment } }
    }
  }
  ${PageInfo}
  ${IntegrationWebhookFragment}
`

export const WEBHOOK_Q = gql`
  query Webhook($id: ID!, $cursor: String) {
    integrationWebhook(id: $id) {
      ...IntegrationWebhookFragment
      logs(first: 50, after: $cursor) {
        pageInfo { ...PageInfo }
        edges { node { ...WebhookLogFragment } }
      }
    }
  }
  ${PageInfo}
  ${IntegrationWebhookFragment}
  ${WebhookLogFragment}
`

export const CREATE_WEBHOOK = gql`
  mutation Create($attributes: IntegrationWebhookAttributes!) {
    createIntegrationWebhook(attributes: $attributes) {
      ...IntegrationWebhookFragment
    }
  }
  ${IntegrationWebhookFragment}
`

export const UPDATE_WEBHOOK = gql`
  mutation Update($id: ID!, $attributes: IntegrationWebhookAttributes!) {
    updateIntegrationWebhook(id: $id, attributes: $attributes) {
      ...IntegrationWebhookFragment
    }
  }
  ${IntegrationWebhookFragment}
`

export const DELETE_WEBHOOK = gql`
  mutation Delete($id: ID!) {
    deleteIntegrationWebhook(id: $id) {
      ...IntegrationWebhookFragment
    }
  }
  ${IntegrationWebhookFragment}
`

export const OAUTH_Q = gql`
  query { oauthIntegrations { ...OauthIntegration } }
  ${OauthIntegration}
`

export const CREATE_OAUTH = gql`
  mutation Create($attributes: OauthIntegrationAttributes!) {
    createOauthIntegration(attributes: $attributes) {
      ...OauthIntegration
    }
  }
  ${OauthIntegration}
`
