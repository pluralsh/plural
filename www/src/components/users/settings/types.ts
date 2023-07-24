import { ApolloCache } from '@apollo/client'
import {
  DefaultContext,
  MutationUpdaterFunction,
} from '@apollo/client/core/types'
import { DispatchWithoutAction } from 'react'

import { DeleteUserMutation, Exact, User } from '../../../generated/graphql'

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
  onCancel: DispatchWithoutAction
  onDelete: DispatchWithoutAction
  onUpdate: DispatchWithoutAction
}

interface UserSettingsActionsProps extends Omit<UserSettingsProps, 'user'> {
  changed: boolean
  loading?: boolean
}

interface DeleteUserProps {
  user: User
  update?: MutationUpdaterFunction<
    DeleteUserMutation,
    Exact<{ id: string | number }>,
    DefaultContext,
    ApolloCache<any>
  >
  onBack: DispatchWithoutAction
  onDelete: DispatchWithoutAction
}

export type {
  UserSettingsModalProps,
  UserSettingsProps,
  UserSettingsActionsProps,
  DeleteUserProps,
}
