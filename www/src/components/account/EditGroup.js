import { useApolloClient, useMutation } from '@apollo/client'
import { Box, TextInput } from 'grommet'
import { Div, Flex } from 'honorable'
import {
  FormField,
  PersonIcon,
  Switch,
  Tab,
  ValidatedInput,
} from 'pluralsh-design-system'
import { useState } from 'react'

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
  const [view, setView] = useState('attributes')
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

  return (
    <Box
      fill
      gap="small"
    >
      {error && (
        <GqlError
          header="Something broke"
          error={error}
        />
      )}
      <Flex>
        <Tab
          active={view === 'attributes'}
          onClick={() => setView('attributes')}
        >
          Attributes
        </Tab>
        <Tab
          active={view === 'users'}
          onClick={() => setView('users')}
        >
          Users
        </Tab>
        <Div
          flexGrow={1}
          borderBottom="1px solid border"
        />
      </Flex>
      {view === 'attributes' && (
        <Box
          gap="small"
          fill
        >
          <ValidatedInput
            value={name}
            onChange={({ target: { value } }) => setName(value)}
            label="Name"
          />
          <ValidatedInput
            label="Description"
            value={description}
            onChange={({ target: { value } }) => setDescription(value)}
          />
          <Switch
            checked={global}
            onChange={({ target: { checked } }) => setGlobal(checked)}
          >
            Global
          </Switch>
          <Actions
            cancel={cancel}
            submit={mutation}
            loading={loading}
            action="Update"
          />
        </Box>
      )}
      {view === 'users' && (
        <Box
          gap="small"
          pad={{ bottom: 'small' }}
          fill
        >
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
        </Box>
      )}
    </Box>
  )
}
