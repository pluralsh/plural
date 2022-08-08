import { useCallback, useState } from 'react'
import { useApolloClient } from '@apollo/client'
import { Box, Text, TextInput } from 'grommet'
import {
  FormField, PeopleIcon, PersonIcon, Token,
} from 'pluralsh-design-system'
import { Flex } from 'honorable'

import Avatar from '../users/Avatar'
import { SEARCH_GROUPS, SEARCH_USERS } from '../accounts/queries'

export function fetchUsers(client, query, setSuggestions) {
  if (!query) return

  client.query({
    query: SEARCH_USERS,
    variables: { q: query, all: true },
  }).then(({ data: { users: { edges } } }) => edges.map(({ node }) => ({ value: node, label: userSuggestion(node) })))
    .then(setSuggestions)
}

export function fetchGroups(client, query, setSuggestions) {
  if (!query) return

  client.query({
    query: SEARCH_GROUPS,
    variables: { q: query },
  }).then(({ data: { groups: { edges } } }) => edges.map(({ node }) => ({ value: node, label: groupSuggestion(node) })))
    .then(setSuggestions)
}

function userSuggestion(user) {
  return (
    <Box
      direction="row"
      align="center"
      gap="small"
      pad="xsmall"
    >
      <Avatar
        size="30px"
        user={user}
      />
      <Box>
        <Text
          size="small"
          weight={500}
        >{user.name}
        </Text>
        <Text size="small">{user.email}</Text>
      </Box>
    </Box>
  )
}

function groupSuggestion(group) {
  return (
    <Box
      direction="row"
      gap="small"
      align="center"
      pad="small"
    >
      <Text
        size="small"
        weight={500}
      >{group.name}
      </Text>
      <Text size="small">-- {group.description}</Text>
    </Box>
  )
}

function TagInput({
  placeholder, label, hint, suggestions, items, icon, onRemove, onAdd, width, onChange,
}) {
  const [value, setValue] = useState('')

  const add = useCallback(tag => {
    onAdd(tag)
    setValue('')
  }, [setValue, onAdd])

  return (
    <Box gap="4px">
      <FormField
        label={label}
        hint={hint}
        width={width}
      >
        <TextInput
          icon={icon}
          width="100%"
          value={value}
          placeholder={placeholder}
          suggestions={suggestions}
          onChange={e => {
            setValue(e.target.value)
            onChange(e)
          }}
          onSelect={e => {
            e.stopPropagation(); add(e.suggestion)
          }}
        />
      </FormField>
      <Flex
        align="stretch"
        gap="4px"
        wrap="wrap"
      >
        {items.map(t => (
          <Token
            key={t}
            onClick={() => onRemove(t)}
            hue="lighter"
          >{t}
          </Token>
        ))}
      </Flex>
    </Box>
  )
}

const ICONS = {
  user: <PersonIcon size={14} />,
  group: <PeopleIcon size={14} />,
}

const TEXT = {
  user: { label: 'User bindings', placeholder: 'Search for user' },
  group: { label: 'Group bindings', placeholder: 'Search for group' },
}

const FETCHER = {
  user: fetchUsers,
  group: fetchGroups,
}

export function BindingInput({
  type, fetcher, bindings, remove, add, hint, placeholder = TEXT[type]?.placeholder, label = TEXT[type]?.label,
}) {
  const client = useApolloClient()
  const [suggestions, setSuggestions] = useState([])
  const fetch = fetcher || FETCHER[type]

  return (
    <TagInput
      noborder
      placeholder={placeholder}
      hint={hint}
      icon={type ? ICONS[type] : null}
      label={label}
      round="xsmall"
      width="100%"
      suggestions={suggestions}
      items={bindings}
      onRemove={remove}
      onAdd={({ value }) => add(value)}
      onChange={({ target: { value } }) => fetch(client, value, setSuggestions)}
    />
  )
}

export function UserTypeahead({
  users, setUsers, label, hint, children,
}) {
  const client = useApolloClient()
  const [suggestions, setSuggestions] = useState([])

  return (
    <TagInput
      icon={<PersonIcon size={14} />}
      label={label || 'User Bindings'}
      placeholder="Search for users by name or email..."
      hint={hint}
      round="xsmall"
      noborder
      suggestions={suggestions}
      items={users.map(u => u.email)}
      onRemove={email => setUsers(users.filter(u => u.email !== email))}
      onAdd={({ value }) => setUsers([value, ...users])}
      onChange={({ target: { value } }) => fetchUsers(client, value, setSuggestions)}
      button={children}
    />
  )
}

export function GroupTypeahead({
  groups, setGroups, label, hint, children,
}) {
  const client = useApolloClient()
  const [suggestions, setSuggestions] = useState([])

  return (
    <TagInput
      placeholder="Search for groups by name..."
      label={label || 'Group Bindings'}
      hint={hint}
      icon={<PeopleIcon size={15} />}
      suggestions={suggestions}
      items={groups.map(u => u.name)}
      onRemove={name => setGroups(groups.filter(u => u.name !== name))}
      onAdd={({ value }) => setGroups([value, ...groups])}
      onChange={({ target: { value } }) => fetchGroups(client, value, setSuggestions)}
      button={children}
    />
  )
}
