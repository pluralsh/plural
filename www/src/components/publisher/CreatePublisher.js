import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { Box, Text, TextInput } from 'grommet'
import { Button } from 'forge-core'

import { ME_Q } from '../users/queries'
import { deepUpdate, updateCache } from '../../utils/graphql'

import { CREATE_PUBLISHER } from './queries'

function Input({ label, header, placeholder, value, setValue }) {
  return (
    <Box>
      <Text
        size="small"
        weight="bold"
      >{header}
      </Text>
      <TextInput
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={({ target: { value } }) => setValue(value)}
      />
    </Box>
  )
}

export default function CreatePublisher({ onCreate }) {
  const [attributes, setAttributes] = useState({ description: '', name: '' })
  const [mutation, { loading }] = useMutation(CREATE_PUBLISHER, {
    variables: { attributes },
    update: (cache, { data: { createPublisher } }) => updateCache(cache, {
      query: ME_Q,
      update: prev => deepUpdate(prev, 'me.publisher', () => createPublisher),
    }),
    onCompleted: onCreate,
  })

  return (
    <Box
      gap="small"
      pad="small"
    >
      <Input
        label="name"
        header="1. Add a name"
        placeholder="a name"
        value={attributes.name}
        setValue={name => setAttributes({ ...attributes, name })}
      />
      <Input
        label="description"
        header="2. Add a description"
        placeholder="a short description"
        value={attributes.description}
        setValue={description => setAttributes({ ...attributes, description })}
      />
      <Box
        direction="row"
        justify="end"
      >
        <Button
          round="xsmall"
          label="create"
          loading={loading}
          onClick={mutation}
        />
      </Box>
    </Box>
  )
}
