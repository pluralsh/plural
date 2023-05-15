import { forwardRef } from 'react'
import { FormField } from '@pluralsh/design-system'
import { Input } from 'honorable'

export const LabelledInput = forwardRef(
  (
    {
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
    }: any,
    ref
  ) => (
    <FormField
      label={label}
      caption={caption}
      hint={hint}
      marginBottom="small"
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
    </FormField>
  )
)
