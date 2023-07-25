import {
  Button,
  CaretLeftIcon,
  FormField,
  Input,
} from '@pluralsh/design-system'
import { Switch } from 'honorable'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import {
  GroupAttributes,
  useCreateGroupMutation,
} from '../../../generated/graphql'
import { GqlError } from '../Alert'

import { CreateGroupInputsProps } from './types'

const CreateGroupInputs = styled(CreateGroupInputsUnstyled)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.medium,

  '.message': {
    ...theme.partials.text.body2,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xsmall,
  },

  '.switch': {
    display: 'flex',
  },
}))

function CreateGroupInputsUnstyled({
  onValidityChange,
  onChange,
  ...props
}: CreateGroupInputsProps): ReactElement {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [global, setGlobal] = useState(false)
  const valid = useMemo(() => !!name, [name])

  useEffect(() => onValidityChange?.(valid), [onValidityChange, valid])
  useEffect(
    () => onChange?.({ name, global, description } as GroupAttributes),
    [name, global, description, onChange]
  )

  return (
    <div {...props}>
      <FormField
        label="Name"
        required
      >
        <Input
          autoFocus
          placeholder="New group"
          value={name}
          onChange={({ target: { value } }) => setName(value)}
        />
      </FormField>
      <FormField label="Description">
        <Input
          placeholder="New group description"
          value={description}
          onChange={({ target: { value } }) => setDescription(value)}
        />
      </FormField>
      <div className="switch">
        <Switch
          checked={global}
          onChange={({ target: { checked } }) => setGlobal(checked)}
        >
          <span className="message">Global</span>
        </Switch>
      </div>
    </div>
  )
}

const CreateGroupActions = styled(CreateGroupActionsUnstyled)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: theme.spacing.medium,
  padding: `${theme.spacing.small}px 0 ${theme.spacing.xsmall}px 0`,
}))

function CreateGroupActionsUnstyled({
  disabled,
  loading,
  onBack,
  onCreate,
  ...props
}): ReactElement {
  return (
    <div {...props}>
      {onBack && (
        <Button
          secondary
          onClick={onBack}
          startIcon={<CaretLeftIcon />}
        >
          Back
        </Button>
      )}
      <div />
      <Button
        disabled={disabled || loading}
        loading={loading}
        onClick={onCreate}
      >
        Create
      </Button>
    </div>
  )
}

const CreateGroup = styled(CreateGroupUnstyled)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: theme.spacing.medium,
}))

function CreateGroupUnstyled({ onCreate, onBack, ...props }): ReactElement {
  const [valid, setValid] = useState(false)
  const [attributes, setAttributes] = useState<GroupAttributes>(
    {} as GroupAttributes
  )
  const [createGroup, { loading, error }] = useCreateGroupMutation({
    variables: {
      attributes,
    },
    onCompleted: (result) => {
      onCreate?.(result.createGroup)
      onBack?.()
    },
  })

  return (
    <div {...props}>
      {error && (
        <GqlError
          error={error}
          header="Failed to create group"
        />
      )}
      <CreateGroupInputs
        onValidityChange={setValid}
        onChange={setAttributes}
      />
      <CreateGroupActions
        disabled={!valid || loading}
        loading={loading}
        onCreate={createGroup}
        onBack={onBack}
      />
    </div>
  )
}

export default CreateGroup
