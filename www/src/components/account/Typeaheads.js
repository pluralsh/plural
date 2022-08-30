import { useEffect, useState } from 'react'
import { useApolloClient } from '@apollo/client'
import {
  AppIcon,
  Chip,
  ComboBox,
  FormField,
  ListBoxItem,
  ListBoxItemChipList,
  PeopleIcon,
  PersonIcon,
} from 'pluralsh-design-system'

import styled from 'styled-components'

import { SEARCH_GROUPS, SEARCH_USERS } from '../accounts/queries'

export function fetchUsers(client, query, setSuggestions) {
  if (!query) return

  client
    .query({
      query: SEARCH_USERS,
      variables: { q: query, all: true },
    })
    .then(({
      data: {
        users: { edges },
      },
    }) => edges.map(({ node }) => ({ value: node, label: userSuggestion(node) })))
    .then(setSuggestions)
}

export function fetchGroups(client, query, setSuggestions) {
  if (!query) return
  client
    .query({
      query: SEARCH_GROUPS,
      variables: { q: query },
    })
    .then(({
      data: {
        groups: { edges },
      },
    }) => edges.map(({ node }) => ({ value: node, label: groupSuggestion(node) })))
    .then(setSuggestions)
}

const ChipList = styled(ListBoxItemChipList)(({ theme }) => ({
  marginTop: theme.spacing.small,
  justifyContent: 'start',
}))

function userSuggestion({
  name, email, avatar, id,
}) {
  return (
    <ListBoxItem
      key={id}
      label={name}
      textValue={`${name} - ${email}`}
      description={email}
      leftContent={(
        <AppIcon
          spacing="none"
          size="xsmall"
          name={name}
          url={avatar}
        />
      )}
    />
  )
}

function groupSuggestion({ name, description, id }) {
  return (
    <ListBoxItem
      key={id}
      label={name}
      textValue={`${name} - ${description}`}
      description={description}
      leftContent={<PeopleIcon />}
    />
  )
}

function TagInput({
  placeholder,
  label,
  hint,
  suggestions,
  items,
  icon,
  onRemove,
  onAdd,
  width,
  onChange,
}) {
  const [inputValue, setInputValue] = useState('')

  // only run on first render
  // make sure there will be data in Combo Box to start with
  useEffect(() => {
    onChange({ target: { value: inputValue } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <TagPicker>
      <FormField
        label={label}
        hint={hint}
        width={width}
      >
        <ComboBox
          inputValue={inputValue}
          onSelectionChange={key => {
            const selection = suggestions.find(s => s?.value?.id === key)

            if (selection) onAdd(selection)
          }}
          onInputChange={value => {
            setInputValue(value)
            onChange({ target: { value } })
          }}
          startIcon={icon}
          inputProps={{
            placeholder,
          }}
        >
          {suggestions.map(({ label }) => label)}
        </ComboBox>
        {items?.length > 0 && (
          <ChipList
            maxVisible={Infinity}
            chips={items.map(key => (
              <Chip
                size="small"
                clickable
                onClick={() => {
                  onRemove(key)
                }}
                closeButton
              >
                {key}
              </Chip>
            ))}
          />
        )}
      </FormField>
    </TagPicker>
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

const TagPicker = styled.div(({ theme: _theme }) => ({}))

export function BindingInput({
  type,
  fetcher,
  bindings,
  remove,
  add,
  hint,
  placeholder = TEXT[type]?.placeholder,
  label = TEXT[type]?.label,
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
