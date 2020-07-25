import React, { useState } from 'react'
import { useParams } from 'react-router'
import { useMutation, useQuery } from 'react-apollo'
import { Button } from 'forge-core'
import { SIGNUP, INVITE_Q } from './graphql/users'
import { Box, Keyboard, FormField, TextInput, Text } from 'grommet'
import { setToken } from '../helpers/auth'

function InvalidInvite() {
  return (
    <Box width='100vw' height='100vh' justify='center' align='center'>
      <Box>
        <Text>That invite code is no longer valid</Text>
      </Box>
    </Box>
  )
}

export default function SignUp() {
  const {inviteId} = useParams()
  const [attributes, setAttributes] = useState({name: '', password: ''})
  const [mutation, {loading}] = useMutation(SIGNUP, {
    variables: {inviteId, attributes},
    onCompleted: ({signUp: {jwt}}) => {
      setToken(jwt)
      window.location = '/'
    }
  })
  const {data, error} = useQuery(INVITE_Q, {variables: {id: inviteId}})
  if (error) return <InvalidInvite />
  if (!data) return null

  return (
    <Box align="center" justify="center" height="100vh">
      <Box width="60%" pad='medium' border={{color: 'light-3'}} elevation="small">
        <Keyboard onEnter={mutation}>
          <>
          <Box justify='center' align='center'>
            <Text weight="bold">Sign Up</Text>
          </Box>
          <FormField label='email' disabled>
            <TextInput value={data.invite.email} />
          </FormField>
          <FormField label='name'>
            <TextInput
              value={attributes.name}
              placeholder='John Doe'
              onChange={({target: {value}}) => setAttributes({...attributes, name: value})} />
          </FormField>
          <FormField label='password'>
            <TextInput
              value={attributes.password}
              placeholder='battery horse fire stapler'
              onChange={({target: {value}}) => setAttributes({...attributes, password: value})} />
          </FormField>
          <Box direction='row' justify='end'>
            <Button loading={loading} label='Sign up' onClick={mutation} />
          </Box>
          </>
        </Keyboard>
      </Box>
    </Box>
  )
}