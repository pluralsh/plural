import React, { useState } from 'react'
import { useMutation } from 'react-apollo'
import gql from 'graphql-tag'
import {Box, Form, Keyboard, FormField, Text, Anchor} from 'grommet'
import Error from './utils/Error'
import Button from './utils/Button'
import {fetchToken, setToken} from '../helpers/authentication'

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

function Login(props) {
  const [state, setState] = useState({
    login: true, // switch between Login and SignUp
    email: '',
    password: '',
    name: '',
  })
  const {email, login, name, password} = state

  const [mutation, {loading, error}] = useMutation(login ? LOGIN_MUTATION : SIGNUP_MUTATION, {
    variables: { email, password, name },
    onCompleted: data => {
      const { jwt } = state.login ? data.login : data.signup
      setToken(jwt)
      props.history.push(`/`)
    }
  })

  if (fetchToken()) {
    props.history.push('/')
  }

  return (
    <Box direction="column" align="center" justify="center" height="100vh">
      <Box width="60%" pad='medium' border={{style: "hidden"}} elevation="small">
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
                  label="name"
                  name="Name"
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
            <Box direction="row" align="center">
              <Button
                onClick={mutation}
                loading={loading}
                size='small'
                round='xsmall'
                pad={{vertical: 'xsmall', horizontal: 'medium'}}
                label={login ? 'login' : 'sign up'} />
              <Anchor
                margin={{left: '10px'}}
                size="small"
                fontWeight="400"
                onClick={() => setState({...state, login: !login})}>
                {login ? 'need to create an account?' : 'already have an account?'}
              </Anchor>
            </Box>
          </Form>
        </Keyboard>
      </Box>
    </Box>
  )
}

export default Login