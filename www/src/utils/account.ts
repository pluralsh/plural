import { CurrentUser } from '../contexts/CurrentUserContext'

export const canEdit = (user: CurrentUser, account?: CurrentUser['account']) =>
  (user.roles && user.roles.admin) || user.id === account?.rootUser?.id
