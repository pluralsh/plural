import React, { useState, useContext } from 'react'
import styled from 'styled-components'
import { useApolloClient } from 'react-apollo'
import { useHistory } from 'react-router-dom'
import { TextInput, Box, ThemeContext } from 'grommet'
import { SEARCH_REPOS } from './queries'
import { Repository } from './Repositories'
import { SearchIcon } from '../utils/SearchIcon'
import { PLURAL_THEME } from '../../theme'

export function searchRepositories(client, query, callback) {
  if (query.length === 0) return

  client.query({
    query: SEARCH_REPOS,
    variables: {query}
  }).then(({data: {searchRepositories}}) => {
    return searchRepositories.edges.map(({node}) => {
      return {value: node, label: <Repository repo={node} />}
    })
  }).then(callback)
}

const hoverable = styled.div`
  &:focus-within {
    background-color: ${PLURAL_THEME['tone-dark-2']};
  }
`

export default function SearchRepositories() {
  const client = useApolloClient()
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  let history = useHistory()

  return (
    <Box as={hoverable} width='350px' direction='row' align='center' background='sidebarHover'
        round='xsmall' pad={{horizontal: 'xsmall', vertical: '2px'}} focusIndicator={false}>
      <ThemeContext.Extend value={{global: {input: {padding: '7px'}}}}>
      <TextInput
        plain='full'
        type="search"
        value={value}
        name='search'
        suggestions={suggestions}
        placeholder='search for a repo'
        onSelect={({suggestion}) => {
          setValue('')
          setSuggestions([])
          history.push(`/repositories/${suggestion.value.id}`)
        }}
        onChange={({target: {value}}) => {
          setValue(value)
          searchRepositories(client, value, setSuggestions)
        }}  />
      </ThemeContext.Extend>
      <SearchIcon border='dark-3' color='white' size={15} pad={8} />
    </Box>
  )
}