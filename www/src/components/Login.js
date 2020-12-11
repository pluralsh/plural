import React, { useEffect, useState } from 'react'
import { useMutation } from 'react-apollo'
import gql from 'graphql-tag'
import { Box, Form, Keyboard, FormField, Text, Anchor } from 'grommet'
import { Error, Button } from 'forge-core'
import {fetchToken, setToken} from '../helpers/authentication'
import { Tab, TabContent, Tabs } from './utils/Tabs'

const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!, $name: String!) {
    signup(attributes: {email: $email, password: $password, name: $name}) {
      jwt
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      jwt
    }
  }
`;

const State = {
  LOGIN: 'login',
  SIGNUP: 'sign up'
}

export default function Login(props) {
  const [tab, setTab] = useState(State.LOGIN)
  const [state, setState] = useState({
    email: '',
    password: '',
    name: '',
  })
  const login = tab === State.LOGIN
  const {email, name, password} = state

  const [mutation, {loading, error}] = useMutation(login ? LOGIN_MUTATION : SIGNUP_MUTATION, {
    variables: { email, password, name },
    onCompleted: ({login, signup}) => {
      setToken(login ? login.jwt : signup.jwt)
      props.history.push(`/`)
    }
  })

  useEffect(() => {
    if (fetchToken()) {
      props.history.push('/')
    }
  }, [])

  return (
    <Box direction="column" align="center" justify="center" height="100vh" background='light-1'>
      <Box width="60%" pad='medium'>
        <Tabs>
          <Tab name={State.LOGIN} setTab={setTab} selected={tab} />
          <Tab name={State.SIGNUP} setTab={setTab} selected={tab} />
        </Tabs>
        <TabContent>
          <Box pad='medium' background='white'>
            {error && <Error errors={error} />}
            <Keyboard onEnter={mutation}>
              <Form onSubmit={mutation}>
                <Box margin={{bottom: '10px'}}>
                  <Box direction="column" justify="center" align="center">
                    <Text size="medium" weight="bold">{login ? 'Login' : 'Sign Up'}</Text>
                  </Box>
                  {!login && (
                    <FormField
                      value={name}
                      label="Name"
                      name="name"
                      onChange={e => setState({...state, name: e.target.value })}
                      placeholder="your name"
                    />)}
                  <FormField
                    value={email}
                    name="email"
                    label="Email"
                    onChange={e => setState({...state, email: e.target.value })}
                    placeholder="Your email address"
                  />
                  <FormField
                    value={password}
                    name="password"
                    label="Password (at least 10 chars)"
                    type="password"
                    onChange={e => setState({...state, password: e.target.value })}
                    placeholder="battery horse fire stapler"
                  />
                </Box>
                <Box direction="row" align="center" justify='end'>
                  <Button
                    onClick={mutation}
                    loading={loading}
                    size='small'
                    round='xsmall'
                    pad={{vertical: 'xsmall', horizontal: 'medium'}}
                    label={login ? 'login' : 'sign up'} />
                </Box>
              </Form>
            </Keyboard>
          </Box>
        </TabContent>
      </Box>
    </Box>
  )
}