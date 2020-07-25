import React, { useContext, useState, useEffect } from 'react'
import { Box, Text } from 'grommet'
import { InputCollection, ResponsiveInput, Expander, Button } from 'forge-core'
import { LoginContext } from './Login'
import { useMutation } from 'react-apollo'
import { BreadcrumbsContext } from './Breadcrumbs'
import { UPDATE_USER } from './graphql/users'

export function Avatar({me, size, round, textSize, ...rest}) {
  return (
    <Box
      align='center'
      justify='center'
      width={size}
      height={size}
      background={me.backgroundColor}
      pad='small'
      round={round || 'xsmall'}
      {...rest}>
      <Text size={textSize || 'small'}>
        {me.name.substring(0, 1)}
      </Text>
    </Box>
  )
}

export default function EditUser() {
  const {me} = useContext(LoginContext)
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  const [attributes, setAttributes] = useState({name: me.name, email: me.email})
  const [password, setPassword] = useState('')
  useEffect(() => setBreadcrumbs([{text: 'me', url: '/me/edit'}]), [])
  const mergedAttributes = password && password.length > 0 ? {...attributes, password} : attributes
  const [mutation, {loading}] = useMutation(UPDATE_USER, {variables: {attributes: mergedAttributes}})

  return (
    <Box pad='small'>
      <Box direction='row'>
        <Box width='40%' pad='medium'>
          <Box direction='row' align='center' gap='medium'>
            <Avatar me={me} size='80px' />
            <Box>
              <Text>{me.name}</Text>
              <Text size='small'>{me.email}</Text>
            </Box>
          </Box>
        </Box>
        <Box width='60%'>
          <Box elevation='xsmall' border={{color: 'light-3'}}>
            <Box pad='small'>
              <Text weight='bold' size='small'>Edit {me.name}</Text>
            </Box>
            <Expander text='attributes'>
              <Box pad='small'>
                <InputCollection>
                  <ResponsiveInput
                    value={attributes.name}
                    label='name'
                    onChange={({target: {value}}) => setAttributes({...attributes, name: value})} />
                  <ResponsiveInput
                    value={attributes.email}
                    label='email'
                    onChange={({target: {value}}) => setAttributes({...attributes, email: value})} />
                </InputCollection>
                <Box direction='row' justify='end'>
                  <Button loading={loading} onClick={mutation} label='Update' />
                </Box>
              </Box>
            </Expander>
            <Expander text='password'>
              <Box pad='small'>
                <InputCollection>
                  <ResponsiveInput
                    value={password}
                    label='password'
                    type='password'
                    onChange={({target: {value}}) => setPassword(value)} />
                </InputCollection>
                <Box direction='row' justify='end'>
                  <Button loading={loading} onClick={mutation} label='Update' />
                </Box>
              </Box>
            </Expander>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}