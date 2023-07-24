import { GroupAttributes } from '../../../generated/graphql'

interface CreateGroupInputsProps {
  onValidityChange?: (valid: boolean) => void
  onChange?: (group: GroupAttributes) => void
}

export type { CreateGroupInputsProps }
