import { useState } from 'react'
import { useApolloClient } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { Box } from 'grommet'
import { TextInput } from 'pluralsh-design-system'

import { SearchIcon } from '../utils/SearchIcon'

import { SEARCH_REPOS } from './queries'
import { Repository } from './Repositories'

export function searchRepositories(client, query, callback) {
  if (query.length === 0) return

  client.query({
    query: SEARCH_REPOS,
    variables: { query },
  }).then(({ data: { searchRepositories } }) => searchRepositories.edges.map(({ node }) => ({
    value: node,
    label: (
      <Box style={{ maxWidth: 350 }}>
        <Repository repo={node} />
      </Box>
    ),
  }))).then(callback)
}

export default function SearchRepositories() {
  const client = useApolloClient()
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const navigate = useNavigate()

  return (
    <Box
      width="350px"
      direction="row"
      align="center"
      border={{ side: 'all' }}
      style={{ borderRadius: 2 }}
      pad={{ vertical: '4px' }}
      focusIndicator={false}
    >
      <TextInput
        plain="full"
        type="text"
        value={value}
        name="search"
        icon={<SearchIcon color="text-weak" />}
        suggestions={suggestions}
        placeholder="search for a repository"
        onSelect={({ suggestion }) => {
          setValue('')
          setSuggestions([])
          navigate(`/repositories/${suggestion.value.id}`)
        }}
        onChange={({ target: { value } }) => {
          setValue(value)
          if (value) {
            searchRepositories(client, value, setSuggestions)
          }
          else {
            setSuggestions([])
          }
        }}
      />
    </Box>
  )
}
