import { type ComponentProps, type ReactNode, type Ref } from 'react'
import { FormField, Input } from '@pluralsh/design-system'
import styled from 'styled-components'

type LabelledInputProps = {
  label?: string
  value?: Nullable<string>
  onChange?: (value: string) => void
  placeholder?: string
  type?: string
  caption?: ReactNode
  hint?: ReactNode
  error?: boolean
  required?: boolean
  disabled?: boolean
  inputProps?: Partial<ComponentProps<typeof Input>>
  ref?: Ref<HTMLDivElement>
} & Omit<
  ComponentProps<typeof FormField>,
  'label' | 'onChange' | 'children' | 'ref'
>

export function LabelledInput({
  ref,
  label,
  value,
  onChange,
  placeholder,
  type,
  caption,
  hint,
  error = undefined,
  required = false,
  disabled = false,
  inputProps,
  ...props
}: LabelledInputProps) {
  return (
    <FormFieldSC
      label={label}
      caption={caption}
      hint={hint}
      error={error}
      required={required}
      {...props}
    >
      <Input
        ref={ref}
        width="100%"
        name={label}
        type={type}
        value={value || ''}
        onChange={onChange && (({ target: { value } }) => onChange(value))}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        {...inputProps}
      />
    </FormFieldSC>
  )
}

const FormFieldSC = styled(FormField)(({ theme }) => ({
  marginBottom: theme.spacing.small,
}))
