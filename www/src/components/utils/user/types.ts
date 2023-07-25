import { ApolloCache } from '@apollo/client'
import {
  DefaultContext,
  MutationUpdaterFunction,
} from '@apollo/client/core/types'
import { DispatchWithoutAction } from 'react'

import { DeleteUserMutation, Exact, User } from '../../../generated/graphql'

interface DeleteUserProps {
  user: User
  update?: MutationUpdaterFunction<
    DeleteUserMutation,
    Exact<{ id: string | number }>,
    DefaultContext,
    ApolloCache<any>
  >
  onBack?: DispatchWithoutAction
  onDelete: DispatchWithoutAction
}

export type { DeleteUserProps }
