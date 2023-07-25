import { ApolloCache } from '@apollo/client'
import {
  DefaultContext,
  MutationUpdaterFunction,
} from '@apollo/client/core/types'
import { DispatchWithoutAction } from 'react'

import {
  DeleteUserMutation,
  Exact,
  Group,
  User,
} from '../../../generated/graphql'

interface UserSettingsModalProps {
  user: User
  update?: MutationUpdaterFunction<
    DeleteUserMutation,
    Exact<{ id: string | number }>,
    DefaultContext,
    ApolloCache<any>
  >
  onClose: DispatchWithoutAction
}
interface UserSettingsProps {
  user: User
  bindings: Array<Group>
  onCreateGroup: DispatchWithoutAction
  onCancel: DispatchWithoutAction
  onDelete: DispatchWithoutAction
  onUpdate: DispatchWithoutAction
}

interface UserSettingsActionsProps
  extends Omit<UserSettingsProps, 'user' | 'onCreateGroup' | 'bindings'> {
  changed: boolean
  loading?: boolean
}

export type {
  UserSettingsModalProps,
  UserSettingsProps,
  UserSettingsActionsProps,
}
