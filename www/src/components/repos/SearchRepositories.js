import React, {useState} from 'react'
import {useApolloClient} from 'react-apollo'
import {useHistory} from 'react-router-dom'
import {TextInput, Box} from 'grommet'
import {Search} from 'grommet-icons'
import {SEARCH_REPOS} from './queries'
import {Repository} from './Repositories'

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
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  let history = useHistory()

  return (
    <Box width='60%' background='#fff' direction='row' align='center'
      round='xsmall' pad={{horizontal: 'xsmall'}} border>
      <Search size='15px' />
      <TextInput type="search" plain value={value} suggestions={suggestions} placeholder='search for a repo'
        onSelect={({suggestion}) => {
          setValue('')
          setSuggestions([])
          history.push(`/repositories/${suggestion.value.id}`)
        }}
        onChange={({target: {value}}) => {
          setValue(value)
          searchRepositories(client, value, setSuggestions)
        }}  />
    </Box>
  )
}

export default SearchRepositories