export const EntityType = {
  MENTION: 'MENTION',
  EMOJI: 'EMOJI'
}

export const IncidentStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  COMPLETE: 'COMPLETE'
}

export const FileTypes = {
  OTHER: 'OTHER',
  IMAGE: 'IMAGE'
}

export const IncidentView = {
  MSGS: 'm',
  FILES: 'f',
  POST: 'p'
}

export const Action = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
  ACCEPT: 'ACCEPT',
  COMPLETE: 'COMPLETE',
  STATUS: 'STATUS',
  SEVERITY: 'SEVERITY'
}

export const SidebarView = {
  HISTORY: 'history',
  NOTIF: 'notifications',
  FOLLOW: 'followers',
  SUBSCRIPTION: 'subscription',
  CLUSTER: 'cluster'
}

export const NotificationTypes = {
  MESSAGE: 'MESSAGE',
  INCIDENT_UPDATE: 'INCIDENT_UPDATE',
  MENTION: 'MENTION'
}

export const Order = {
  ASC: 'ASC',
  DESC: 'DESC'
}

export const IncidentSort = {
  INSERTED_AT: 'INSERTED_AT',
  SEVERITY: 'SEVERITY',
  STATUS: 'STATUS',
  TITLE: 'TITLE'
}

export const IncidentSortNames = {
  INSERTED_AT: 'Creation Date',
  SEVERITY: 'Severity',
  STATUS: 'Status',
  TITLE: 'Title'
}

export const IncidentFilter = {
  NOTIFICATIONS: 'NOTIFICATIONS',
  FOLLOWING: 'FOLLOWING',
  TAG: 'TAG'
}

export const SeverityColorMap = ['critical', 'high', 'medium', 'low', 'light-4', 'dark-6']

export const StatusColorMap = {
  OPEN: 'high',
  IN_PROGRESS: 'progress',
  RESOLVED: 'dark-3',
  COMPLETE: 'good'
}