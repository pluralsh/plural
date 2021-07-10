import React, { useState } from 'react'
import { Button } from 'forge-core'
import { Box, Text, TextInput } from 'grommet'
import { useMutation } from 'react-apollo'

function UrlTab({url, onClick}) {
  <Box key={action} background='light-3' round='xsmall' 
       pad={{vertical: '2px', horizontal: 'small'}} hoverIndicator='light-5' 
       onClick={onClick}>
    <Text size='small' weight={500}>{url}</Text>
  </Box>
}

export function UrlsInput({urls, setUrls}) {
  const [value, setValue] = useState('')

  return (
    <Box flex={false} fill='horizontal'>
      <Box flex={false} fill='horizontal' direction='row' gap='small' align='center'>
        <TextInput
          plain
          value={value}
          placeholder='add a redirect url'
          onChange={({target: {value}}) => setValue(value)} />
        <Button label='Add' onClick={() => setUrls([...urls, value])} />
      </Box>
      <Box flex={false} direction='row' gap='xxsmall' align='center' wrap>
        {urls.map((url) => (
          <UrlTab 
            key={url} 
            url={url} 
            onClick={() => setUrls(urls.filter((u) => u !== url))} />
        ))}
      </Box>
    </Box>
  )
}

export function ProviderForm({attributes, setAttributes}) {
  const [attributes, setAttributes] = useState({redirectUris: []})

  return (
    <Box fill>
      <UrlsInput 
        urls={attributes.redirectUris} 
        setUrls={(redirectUris) => setAttributes({...attributes, redirectUris})} />
    </Box>
  )
}

export function CreateProvider({installation}) {
  const [mutation, {loading, error}] = useMutation()
}