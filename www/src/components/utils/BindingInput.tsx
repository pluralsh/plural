import { useState } from 'react'
import { Box, Text } from 'grommet'
import { TagInput } from 'forge-core'
import { PeopleIcon, PersonIcon } from 'pluralsh-design-system'

import { useApolloClient } from '@apollo/client'

const ICONS = {
  user: <PersonIcon size={16} />,
  group: <PeopleIcon size={16} />,
}

const TEXT = {
  user: { label: 'user bindings', placeholder: 'search for users to add' },
  group: { label: 'group bindings', placeholder: 'search for groups to add' },
}

export function BindingInput({
  type, fetcher, bindings, remove, add,
}: any) {
  const client = useApolloClient()
  const [suggestions, setSuggestions] = useState([])
  const { placeholder, label } = TEXT[type]

  return (
    <Box
      direction="row"
      align="center"
      gap="small"
    >
      <Box
        flex={false}
        width="125px"
        direction="row"
        gap="small"
        align="center"
      >
        {type && ICONS[type]}
        <Text
          size="small"
          weight={500}
        >{label}
        </Text>
      </Box>
      <TagInput
        noborder
        placeholder={placeholder}
        round="xsmall"
        suggestions={suggestions}
        value={bindings}
        onRemove={remove}
        onAdd={({ value }) => add(value)}
        onChange={({ target: { value } }) => fetcher(client, value, setSuggestions)}
      />
    </Box>
  )
}

export const sanitize = ({ id, user, group }) => ({ id, userId: user && user.id, groupId: group && group.id })
