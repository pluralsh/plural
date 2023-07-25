import { GroupAttributes } from '../../../generated/graphql'

interface EmailInputProps {
  onValidityChange?: (valid: boolean) => void
  onChange?: (value: string) => void
}

interface CreateGroupInputsProps {
  onValidityChange?: (valid: boolean) => void
  onChange?: (group: GroupAttributes) => void
}

export type { EmailInputProps, CreateGroupInputsProps }
