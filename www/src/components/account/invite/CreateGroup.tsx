import {
  Button,
  CaretLeftIcon,
  FormField,
  Input,
} from '@pluralsh/design-system'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

function CreateGroupInputs({ onValidityChange }): ReactElement {
  const [value, setValue] = useState('')
  const valid = useMemo(() => !!value, [value])

  useEffect(() => onValidityChange?.(valid), [onValidityChange, valid])

  return (
    <>
      <FormField
        label="Name"
        required
      >
        <Input
          placeholder="New group"
          value={value}
          onChange={({ target: { value } }) => setValue(value)}
        />
      </FormField>
      <FormField label="Description">
        <Input placeholder="New group description" />
      </FormField>
    </>
  )
}

const CreateGroupActions = styled(CreateGroupActionsUnstyled)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: theme.spacing.medium,
  padding: `${theme.spacing.xsmall}px 0`,
}))

function CreateGroupActionsUnstyled({
  disabled,
  loading,
  onBack,
  ...props
}): ReactElement {
  return (
    <div {...props}>
      <Button
        secondary
        onClick={onBack}
        startIcon={<CaretLeftIcon />}
      >
        Back
      </Button>
      <Button
        disabled={disabled || loading}
        loading={loading}
      >
        Create
      </Button>
    </div>
  )
}

function CreateGroup({ onBack }): ReactElement {
  const [valid, setValid] = useState(false)

  return (
    <>
      <CreateGroupInputs onValidityChange={setValid} />
      <CreateGroupActions
        onBack={onBack}
        disabled={!valid}
      />
    </>
  )
}

export default CreateGroup
