import { AppIcon } from '@pluralsh/design-system'
import styled from 'styled-components'

import { User } from '../../generated/graphql'

const AuditUserSC = styled.div(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing.small,
  alignItems: 'center',
}))

export function AuditUser({ user }: { user?: Pick<User, 'avatar' | 'name'> }) {
  if (!user) return null

  return (
    <AuditUserSC>
      <AppIcon
        spacing={user.avatar ? 'none' : undefined}
        name={user.name}
        url={user.avatar || undefined}
        size="xxsmall"
      />
      <span>{user.name}</span>
    </AuditUserSC>
  )
}
