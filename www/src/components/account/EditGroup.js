import { useApolloClient, useMutation } from '@apollo/client'
import { TextInput } from 'grommet'
import {
  FormField,
  Input,
  PersonIcon,
  Switch,
  ValidatedInput,
} from 'pluralsh-design-system'
import { useState } from 'react'
import { Flex, Text } from 'honorable'
import { useTheme } from 'styled-components'

import { appendConnection, updateCache } from '../../utils/graphql'
import {
  CREATE_GROUP_MEMBERS,
  GROUP_MEMBERS,
  UPDATE_GROUP,
} from '../accounts/queries'
import { GqlError } from '../utils/Alert'

import { Actions } from './Actions'
import { fetchUsers } from './Typeaheads'
import { GroupMembers } from './Group'

export function EditGroup({ group, cancel }) {
  const client = useApolloClient()
  const [value, setValue] = useState('')
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description)
  const [global, setGlobal] = useState(group.global)
  const [mutation, { loading, error }] = useMutation(UPDATE_GROUP, {
    variables: { id: group.id, attributes: { name, description, global } },
    onCompleted: () => cancel(),
  })
  const [addMut] = useMutation(CREATE_GROUP_MEMBERS, {
    variables: { groupId: group.id },
    update: (cache, { data: { createGroupMember } }) => updateCache(cache, {
      query: GROUP_MEMBERS,
      variables: { id: group.id },
      update: prev => appendConnection(prev, createGroupMember, 'groupMembers'),
    }),
  })
  const [suggestions, setSuggestions] = useState([])
  const theme = useTheme()

  return (
    <Flex
      flexDirection="column"
      gap="large"
    >
      {error && (
        <GqlError
          header="Something went wrong"
          error={error}
        />
      )}
      <Flex
        direction="row"
        gap="medium"
        alignItems="center"
      >
        <Text {...theme.partials.text.body2Bold}>Name:</Text>
        <Input
          width="100%"
          flowGrow={1}
          value={name}
          onChange={({ target: { value } }) => setName(value)}
        />
      </Flex>
      <ValidatedInput
        label="Description"
        value={description}
        onChange={({ target: { value } }) => setDescription(value)}
      />
      <FormField
        label="Add users"
        width="100%"
      >
        <TextInput
          icon={<PersonIcon size={14} />}
          width="100%"
          value={value}
          placeholder="Search for users by name"
          suggestions={suggestions}
          onChange={({ target: { value } }) => {
            setValue(value)
            fetchUsers(client, value, setSuggestions)
          }}
          onSelect={({ suggestion: { value } }) => {
            setValue('')
            addMut({ variables: { userId: value.id } })
          }}
        />
      </FormField>
      <GroupMembers
        group={group}
        edit
      />
      <Switch
        checked={global}
        onChange={({ target: { checked } }) => setGlobal(checked)}
      >
        Apply globally
      </Switch>
      <Actions
        cancel={cancel}
        submit={mutation}
        loading={loading}
        action="Update"
      />
    </Flex>
  )
}
