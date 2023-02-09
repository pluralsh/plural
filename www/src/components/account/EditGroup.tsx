import { useApolloClient } from '@apollo/client'
import {
  Button,
  ComboBox,
  FormField,
  Modal,
  Switch,
  ValidatedInput,
} from '@pluralsh/design-system'
import {
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { Flex, usePrevious } from 'honorable'

import { appendConnection, updateCache } from '../../utils/graphql'
import { GqlError } from '../utils/Alert'
import { useUpdateState } from '../../hooks/useUpdateState'
import { GroupMembersDocument, useCreateGroupMemberMutation, useUpdateGroupMutation } from '../../generated/graphql'

import { Actions } from './Actions'
import { fetchUsers } from './Typeaheads'
import { GroupMembers } from './Group'

export function EditGroupMembers({ group, open, onClose }: any) {
  const client = useApolloClient()
  const [userFilter, setUserFilter] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [errorMsg, setErrorMsg] = useState<ReactNode>()
  const prevOpen = usePrevious(open)

  const [addMut, { loading, error }] = useCreateGroupMemberMutation({
    variables: { groupId: group.id } as any,
    update: (cache, { data }) => updateCache(cache, {
      query: GroupMembersDocument,
      variables: { id: group.id },
      update: prev => appendConnection(prev, data?.createGroupMember, 'groupMembers'),
    }),
  })

  useEffect(() => {
    fetchUsers(client, userFilter, setSuggestions)
  }, [client, userFilter])

  const reset = useCallback(() => {
    setErrorMsg(undefined)
  }, [])

  useEffect(() => {
    if (open && open !== prevOpen) {
      reset()
    }
  })

  useEffect(() => {
    if (error?.graphQLErrors[0].message === 'group_id has already been taken') {
      setErrorMsg(undefined)

      return
    }
    setErrorMsg(error && (
      <GqlError
        header="Problem editing group members"
        error={error}
      />
    ))
  }, [error])

  return (
    <Modal
      header="Edit group members"
      portal
      open={open}
      size="large"
      onClose={onClose}
      actions={(
        <Button
          onClick={onClose}
          loading={loading}
        >
          Done
        </Button>
      )}
    >
      <Flex
        flexDirection="column"
        gap="large"
      >
        {errorMsg}
        <FormField
          label="Add users"
          width="100%"
          {...{
            '& :last-child': {
              marginTop: 0,
            },
          }}
        >
          <ComboBox
            inputValue={userFilter}
            // @ts-expect-error
            placeholder="Search a user"
            onSelectionChange={key => {
              setUserFilter('')
              if (key && typeof key === 'string') {
                // @ts-expect-error
                addMut({ variables: { userId: key } })
              }
            }}
            onInputChange={value => {
              setUserFilter(value)
            }}
          >
            {suggestions.map(({ label }) => label)}
          </ComboBox>
        </FormField>
        <GroupMembers
          group={group}
          edit
        />
      </Flex>
    </Modal>
  )
}

export function EditGroupAttributes({ group, open, onClose }: any) {
  const prevOpen = usePrevious(open)
  const [errorMsg, setErrorMsg] = useState<ReactNode>()

  const {
    state: formState,
    reset: resetForm,
    update,
    hasUpdates,
  } = useUpdateState({
    name: group.name,
    description: group.description,
    global: group.global,
    users: [],
  })
  const { name, description, global } = formState

  const [mutation, { loading, error }] = useUpdateGroupMutation({
    variables: { id: group.id, attributes: { name, description, global } },
    onCompleted: onClose,
  })

  const reset = useCallback(() => {
    resetForm()
    setErrorMsg(undefined)
  }, [resetForm])

  useEffect(() => {
    if (open && open !== prevOpen) {
      reset()
    }
  })
  useEffect(() => {
    setErrorMsg(error && (
      <GqlError
        header="Problem editing group attributes"
        error={error}
      />
    ))
  }, [error])

  return (
    <Modal
      header="Edit group attributes"
      portal
      open={open}
      size="large"
      onClose={onClose}
      actions={(
        <Actions
          cancel={onClose}
          submit={hasUpdates ? () => mutation() : undefined}
          loading={loading}
          action="Update"
        />
      )}
    >
      <Flex
        flexDirection="column"
        gap="large"
      >
        {errorMsg}
        <ValidatedInput
          label="Name"
          value={name}
          onChange={({ target: { value } }) => update({ name: value })}
        />
        <ValidatedInput
          label="Description"
          value={description}
          onChange={({ target: { value } }) => update({ description: value })}
        />
        <Switch
          checked={global}
          onChange={({ target: { checked } }) => update({ global: checked })}
        >
          Apply globally
        </Switch>
      </Flex>
    </Modal>
  )
}
