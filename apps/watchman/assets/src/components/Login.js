import React, { useState } from 'react'
import { Box, Keyboard, Text, FormField, TextInput } from 'grommet'
import Button from './utils/Button'
import { setToken } from '../helpers/auth'

export default function Login() {
  const [secret, setSecret] = useState('')
  const login = () => {
    setToken(secret)
    window.location = '/'
  }

  return (
    <Box direction="column" align="center" justify="center" height="100vh">
      <Box width="60%" pad='medium' border={{style: "hidden"}} elevation="small">
        <Keyboard onEnter={login}>
          <Box margin={{bottom: '10px'}} gap='small'>
            <Box justify='center' align='center'>
              <Text size="medium" weight="bold">Enter your watchman webhook secret</Text>
            </Box>
            <FormField label='Secret'>
              <TextInput
                type='password'
                value={secret}
                placehoder='wh-xxxxxxxx'
                onChange={({target: {value}}) => setSecret(value)} />
            </FormField>
            <Box direction='row' align='center' justify='end'>
              <Button label='Login' onClick={login} />
            </Box>
          </Box>
        </Keyboard>
      </Box>
    </Box>
  )
}