import React, { useState } from 'react'
import { useApolloClient } from 'react-apollo'
import { useHistory } from 'react-router-dom'
import { TextInput, Box } from 'grommet'
import { Search } from 'grommet-icons'
import { SEARCH_REPOS } from './queries'
import { Repository } from './Repositories'

const animation = {
  outline: 'none',
  transition: 'width 0.75s cubic-bezier(0.000, 0.795, 0.000, 1.000)'
};

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

function SearchRepositories() {
  const client = useApolloClient()
  const [focus, setFocus] = useState(false)
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  let history = useHistory()

  return (
    <Box width={focus ? '80%' : '50px'} direction='row' justify='end' align='center'
         round='xsmall' style={animation} pad={{horizontal: 'xsmall'}}
         border={focus ? 'bottom' : null} onClick={() => setFocus(true)}>
      <Search size='20px' />
      {focus && (
        <TextInput
          type="search"
          plain
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          value={value}
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
      )}
    </Box>
  )
}

export default SearchRepositories