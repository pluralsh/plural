import { useState } from 'react'
import styled from 'styled-components'
import { useApolloClient } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { Box, ThemeContext } from 'grommet'
import { MagnifyingGlassIcon, TextInput } from 'pluralsh-design-system'

import { PLURAL_THEME } from '../../theme'

import { SEARCH_REPOS } from './queries'
import { Repository } from './Repositories'

export function searchRepositories(client, query, callback) {
  if (query.length === 0) return

  client.query({
    query: SEARCH_REPOS,
    variables: { query },
  }).then(({ data: { searchRepositories } }) => searchRepositories.edges.map(({ node }) => ({ value: node, label: <Repository repo={node} /> }))).then(callback)
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
      pad={{ horizontal: 'xsmall', vertical: '2px' }}
      focusIndicator={false}
    >
      <ThemeContext.Extend value={{ global: { input: { padding: '7px' } } }}>
        <TextInput
          plain="full"
          type="search"
          value={value}
          name="search"
          icon={<MagnifyingGlassIcon color="text-weak" />}
          suggestions={suggestions}
          placeholder="search for a repo"
          onSelect={({ suggestion }) => {
            setValue('')
            setSuggestions([])
            navigate(`/repositories/${suggestion.value.id}`)
          }}
          onChange={({ target: { value } }) => {
            setValue(value)
            searchRepositories(client, value, setSuggestions)
          }}
        />
      </ThemeContext.Extend>
    </Box>
  )
}
