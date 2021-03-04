export const EntityType = {
  MENTION: 'MENTION'
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
  NOTIF: 'notifications'
}

export const NotificationTypes = {
  MESSAGE: 'MESSAGE',
  INCIDENT_UPDATE: 'INCIDENT_UPDATE'
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
  INSERTED_AT: 'created on',
  SEVERITY: 'severity',
  STATUS: 'status',
  TITLE: 'title'
}

export const IncidentFilter = {
  NOTIFICATIONS: 'NOTIFICATIONS',
  FOLLOWS: 'FOLLOWS',
  TAG: 'TAG'
}