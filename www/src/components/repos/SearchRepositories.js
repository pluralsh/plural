import { useState } from 'react'
import { useApolloClient } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { Box, TextInput } from 'grommet'

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
      <Box
        style={{ maxWidth: 350 }}
        hoverIndicator="fill-two"
      >
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
      style={{ borderRadius: 2 }}
      pad={{ vertical: '4px' }}
      focusIndicator={false}
    >
      <TextInput
        type="text"
        value={value}
        name="search"
        icon={(
          <SearchIcon
            color="text-weak"
          />
        )}
        suggestions={suggestions}
        placeholder="search for a repository"
        onSelect={({ suggestion }) => {
          setValue('')
          setSuggestions([])
          navigate(`/repository/${suggestion.value.id}`)
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
        style={{
          borderRadius: 2,
          height: 32,
          paddingLeft: '1.5rem',
        }}
      />
    </Box>
  )
}
