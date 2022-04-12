import { useEffect, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { Anchor, Box, Form, Keyboard, Text } from 'grommet'
import { Button, InputCollection, ResponsiveInput } from 'forge-core'
import { Checkmark, StatusCritical } from 'grommet-icons'

import { fetchToken, setToken } from '../helpers/authentication'

import { Tab, TabContent, Tabs } from './utils/Tabs'
import { GqlError } from './utils/Alert'

const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!, $name: String!) {
    signup(attributes: {email: $email, password: $password, name: $name}) {
      jwt
    }
  }
`

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      jwt
    }
  }
`

const State = {
  LOGIN: 'login',
  SIGNUP: 'sign up',
}

export function disableState(password, confirm) {
  if (password.length === 0) return { disabled: true, reason: 'enter a password' }
  if (password.length < 10) return { disabled: true, reason: 'password is too short' }
  if (password !== confirm) return { disabled: true, reason: 'passwords do not match' }

  return { disabled: false, reason: 'passwords match!' }
}

export function PasswordStatus({ disabled, reason }) {
  return (
    <Box
      direction="row"
      fill="horizontal"
      align="center"
      gap="xsmall"
    >
      {disabled ? (
        <StatusCritical
          color="error"
          size="12px"
        />
      ) : (
        <Checkmark
          color="good"
          size="12px"
        />
      )}
      <Text
        size="small"
        color={disabled ? 'error' : 'good'}
      >{reason}
      </Text>
    </Box>
  )
}

export default function Login(props) {
  const { history } = props
  const [tab, setTab] = useState(State.LOGIN)
  const [state, setState] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [confirm, setConfirm] = useState('')
  const login = tab === State.LOGIN
  const { email, name, password } = state

  const [mutation, { loading, error }] = useMutation(login ? LOGIN_MUTATION : SIGNUP_MUTATION, {
    variables: { email, password, name },
    onCompleted: ({ login, signup }) => {
      setToken(login ? login.jwt : signup.jwt)
      history.push('/')
    },
  })

  useEffect(() => {
    if (fetchToken()) {
      history.push('/')
    }
  }, [history])

  const { disabled, reason } = disableState(password, confirm)

  return (
    <Box
      align="center"
      justify="center"
      height="100vh"
      background="light-1"
    >
      <Box
        width="60%"
        pad="medium"
      >
        <Tabs>
          <Tab
            name={State.LOGIN}
            setTab={setTab}
            selected={tab}
          />
          <Tab
            name={State.SIGNUP}
            setTab={setTab}
            selected={tab}
          />
        </Tabs>
        <TabContent>
          <Box
            pad="medium"
            background="white"
          >
            {error && (
              <GqlError
                error={error}
                header="Login Failed"
              />
            )}
            <Keyboard onEnter={mutation}>
              <Form onSubmit={mutation}>
                <Box margin={{ bottom: '10px' }}>
                  <InputCollection>
                    {!login && (
                      <ResponsiveInput
                        value={name}
                        label="Name"
                        name="name"
                        onChange={e => setState({ ...state, name: e.target.value })}
                        placeholder="your name"
                      />
                    )}
                    <ResponsiveInput
                      value={email}
                      name="email"
                      label="Email"
                      onChange={e => setState({ ...state, email: e.target.value })}
                      placeholder="Your email address"
                    />
                    <ResponsiveInput
                      value={password}
                      name="password"
                      label="Password"
                      type="password"
                      onChange={e => setState({ ...state, password: e.target.value })}
                      placeholder="battery horse fire stapler"
                    />
                    {!login && (
                      <ResponsiveInput
                        value={confirm}
                        label="Confirm Password"
                        name="confirm"
                        onChange={({ target: { value } }) => setConfirm(value)}
                        placeholder="your name"
                      />
                    )}
                  </InputCollection>
                </Box>
                <Box
                  direction="row"
                  align="center"
                  justify="end"
                  gap="small"
                >
                  {!login && (
                    <PasswordStatus
                      disabled={disabled}
                      reason={reason}
                    />
                  )}
                  {login && (
                    <Anchor
                      href="/password-reset"
                      color="dark-3"
                    >forgot your password?
                    </Anchor>
                  )}
                  <Button
                    onClick={mutation}
                    loading={loading}
                    size="small"
                    round="xsmall"
                    pad={{ vertical: 'xsmall', horizontal: 'medium' }}
                    label={login ? 'login' : 'sign up'}
                  />
                </Box>
              </Form>
            </Keyboard>
          </Box>
        </TabContent>
      </Box>
    </Box>
  )
}
