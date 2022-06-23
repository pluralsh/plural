export const sanitize = ({ id, user, group }) => ({ id, userId: user && user.id, groupId: group && group.id })
