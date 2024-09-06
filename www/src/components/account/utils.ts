import { apiHost } from '../../helpers/hostname'
import { Group, Permission, User } from '../../generated/graphql'
import { notNil } from '../../utils/ts-notNil'
import { CurrentUser } from '../../contexts/CurrentUserContext'

export const inviteLink = (invite) =>
  `https://${apiHost()}/invite/${invite.secureId}`

export type SanitizePropsType = Nullable<{
  id: Nullable<string>
  user: Nullable<User>
  group: Nullable<Group>
}>

export const sanitize = (props: SanitizePropsType) => ({
  id: props?.id,
  userId: props?.user?.id,
  groupId: props?.group?.id,
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
