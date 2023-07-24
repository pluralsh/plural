import { Dispatch, DispatchWithoutAction } from 'react'

import { Group } from '../../../generated/graphql'

interface GroupBase {
  id: string
  name: string
}

interface GroupBindingsComboBoxProps {
  onCreate?: DispatchWithoutAction
  onSelect?: Dispatch<GroupBase>
  onRemove?: Dispatch<GroupBase>
  onInputChange?: Dispatch<string>
  onViewMore?: DispatchWithoutAction

  loading?: boolean
  isDisabled?: boolean
  hasMore?: boolean
  preselected?: Array<Group>
  groups: Array<Group>
}

export type { GroupBindingsComboBoxProps, GroupBase }
