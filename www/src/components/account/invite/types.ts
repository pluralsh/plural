import { GroupAttributes, GroupConnection } from '../../../generated/graphql'

interface EmailInputProps {
  onValidityChange?: (valid: boolean) => void
  onChange?: (value: string) => void
}

interface GroupBase {
  id: string
  name: string
}

interface GroupBindingsSelectorProps {
  onGroupCreate?: () => void
  onQueryChange?: (query: string) => void
  onGroupAdd?: (group: GroupBase) => void
  onGroupRemove?: (group: GroupBase) => void
  groups?: GroupConnection
  selected?: Array<GroupBase>
  loading?: boolean
  fetchMore?: any
}

interface CreateGroupInputsProps {
  onValidityChange?: (valid: boolean) => void
  onChange?: (group: GroupAttributes) => void
}

export type {
  EmailInputProps,
  GroupBindingsSelectorProps,
  GroupBase,
  CreateGroupInputsProps,
}
