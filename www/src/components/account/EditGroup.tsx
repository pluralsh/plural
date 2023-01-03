import { useApolloClient, useMutation } from '@apollo/client'
import {
  ComboBox,
  FormField,
  Modal,
  Switch,
  Tab,
  TabList,
  TabPanel,
  ValidatedInput,
} from '@pluralsh/design-system'
import { useRef, useState } from 'react'
import { Flex } from 'honorable'

import { appendConnection, updateCache } from '../../utils/graphql'

import { GqlError } from '../utils/Alert'

import { CREATE_GROUP_MEMBERS, GROUP_MEMBERS, UPDATE_GROUP } from './queries'

import { Actions } from './Actions'
import { fetchUsers } from './Typeaheads'
import { GroupMembers } from './Group'

const TABS = {
  Attributes: { label: 'Attributes' },
  Users: { label: 'Users' },
}

export function EditGroup({ group, edit, setEdit }: any) {
  const client = useApolloClient()
  const [value, setValue] = useState('')
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description)
  const [global, setGlobal] = useState(group.global)
  const [mutation, { loading, error }] = useMutation(UPDATE_GROUP, {
    variables: { id: group.id, attributes: { name, description, global } },
    onCompleted: () => setEdit(false),
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
  const tabStateRef = useRef<any>(null)
  const [view, setView] = useState('Attributes')

  return (
    <Modal
      header="Edit group"
      portal
      open={edit}
      size="large"
      onClose={() => setEdit(false)}
      actions={(
        <Actions
          cancel={() => setEdit(false)}
          submit={() => mutation()}
          loading={loading}
          action="Update"
        />
      )}
    >
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
        <TabList
          stateRef={tabStateRef}
          stateProps={{
            orientation: 'horizontal',
            selectedKey: view,
            onSelectionChange: key => setView(key as string),
          }}
        >
          {Object.entries(TABS).map(([key, { label }]) => (
            <Tab key={key}>{label}</Tab>
          ))}
        </TabList>
        <TabPanel stateRef={tabStateRef}>
          {view === 'Attributes' && (
            <Flex
              flexDirection="column"
              gap="large"
            >
              <ValidatedInput
                label="Name"
                value={name}
                onChange={({ target: { value } }) => setName(value)}
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
                Apply globally
              </Switch>
            </Flex>
          )}
          {view === 'Users' && (
            <Flex
              flexDirection="column"
              gap="large"
            >
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
                  inputValue={value}
                  // @ts-expect-error
                  placeholder="Search a user"
                  onSelectionChange={key => {
                    setValue('')
                    // @ts-expect-error
                    addMut({ variables: { userId: key } })
                  }}
                  onInputChange={value => {
                    setValue(value)
                    fetchUsers(client, value, setSuggestions)
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
          )}
        </TabPanel>
      </Flex>
    </Modal>
  )
}
