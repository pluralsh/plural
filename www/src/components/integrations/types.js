export const ACTIONS = [
  'incident.create',
  'incident.update',
  'incident.message.create',
  'incident.message.update',
  'incident.message.delete'
]

export const WebhookState = {
  SENDING: 'SENDING',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED'
}

export const StateToColor = {
  SENDING: 'progress',
  DELIVERED: 'success',
  FAILED: 'failed'
}

export const OAuthService = {
  ZOOM: 'ZOOM'
}

export const ParamToService = {
  zoom: OAuthService.ZOOM
}