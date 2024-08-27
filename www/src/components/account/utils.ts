import { apiHost } from '../../helpers/hostname'
import { Permission } from '../../generated/graphql'
import { notNil } from '../../utils/ts-notNil'
import { CurrentUser } from '../../contexts/CurrentUserContext'

export const inviteLink = (invite) =>
  `https://${apiHost()}/invite/${invite.secureId}`

export const sanitize = ({ id, user, group }) => ({
  id,
  userId: user && user.id,
  groupId: group && group.id,
})

export function hasRbac(user: CurrentUser, permission: Permission) {
  if (user.boundRoles != null) {
    const boundRoles = user.boundRoles.filter(notNil)

    return boundRoles.some(
      ({ permissions }) => permissions?.includes(permission)
    )
  }

  return false
}
