import { gql } from '@apollo/client'

export const IntegrationWebhookFragment = gql`
  fragment IntegrationWebhookFragment on IntegrationWebhook {
    id
    name
    url
    secret
    actions
  }
`

export const WebhookLogFragment = gql`
  fragment WebhookLogFragment on WebhookLog {
    id
    state
    status
    payload
    response
    insertedAt
  }
`

export const OauthIntegration = gql`
  fragment OauthIntegration on OauthIntegration {
    id
    service
    insertedAt
  }
`

export const ZoomMeeting = gql`
  fragment ZoomMeeting on ZoomMeeting {
    joinUrl
    password
  }
`
