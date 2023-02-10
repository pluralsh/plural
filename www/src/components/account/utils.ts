import { apiHost } from '../../helpers/hostname'
import {
  Account,
  Permission,
  Role,
  User,
} from '../../generated/graphql'

export const inviteLink = invite => `https://${apiHost()}/invite/${invite.secureId}`

export const sanitize = ({ id, user, group }) => ({ id, userId: user && user.id, groupId: group && group.id })

export const canEdit = (user: User, account?: Account) => (
  (user.roles && user.roles.admin) || user.id === account?.rootUser?.id
)

export function hasRbac(user: User, permission: Permission) {
  if (user.boundRoles != null) {
    const boundRoles = user.boundRoles as Role[]

    return (boundRoles).some(({ permissions }) => permissions?.includes(permission))
  }

  return false
}
