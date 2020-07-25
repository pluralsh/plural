import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import { Box, Keyboard, Text, FormField, TextInput } from 'grommet'
import { Button } from 'forge-core'
import { setToken, wipeToken } from '../helpers/auth'
import { ME_Q, SIGNIN } from './graphql/users'

export const LoginContext = React.createContext({me: null})

export function EnsureLogin({children}) {
  const {data, error} = useQuery(ME_Q)

  if (error) {
    wipeToken()
    window.location = '/login'
  }
  if (!data) return null

  return (
    <LoginContext.Provider value={{me: data.me}}>
      {children}
    </LoginContext.Provider>
  )
}

export default function Login() {
  const [form, setForm] = useState({email: '', password: ''})
  const {data, error} = useQuery(ME_Q)
  const [mutation, {loading}] = useMutation(SIGNIN, {
    variables: form,
    onCompleted: ({signIn: {jwt}}) => {
      setToken(jwt)
      window.location = '/'
    }
  })

  if (!error && data && data.me) {
    window.location = '/'
  }

  return (
    <Box direction="column" align="center" justify="center" height="100vh">
      <Box width="60%" pad='medium' border={{color: 'light-3'}} elevation="small">
        <Keyboard onEnter={mutation}>
          <Box margin={{bottom: '10px'}} gap='small'>
            <Box justify='center' align='center'>
              <Text weight="bold">Login</Text>
            </Box>
            <FormField label='Email'>
              <TextInput
                value={form.email}
                placehoder='someone@example.com'
                onChange={({target: {value}}) => setForm({...form, email: value})} />
            </FormField>
            <FormField label='Password'>
              <TextInput
                type='password'
                value={form.password}
                placehoder='wh-xxxxxxxx'
                onChange={({target: {value}}) => setForm({...form, password: value})} />
            </FormField>
            <Box direction='row' align='center' justify='end'>
              <Button label='Login' onClick={mutation} loading={loading} />
            </Box>
          </Box>
        </Keyboard>
      </Box>
    </Box>
  )
}