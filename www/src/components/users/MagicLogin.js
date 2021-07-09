import React, { useCallback, useEffect, useState } from 'react'
import { Box, Form, Keyboard, TextInput, Collapsible, Text, Anchor } from 'grommet'
import { Button } from 'forge-core'
import { LOGIN_METHOD, LOGIN_MUTATION, PASSWORDLESS_LOGIN } from './queries'
import { useLazyQuery, useMutation } from 'react-apollo'
import { LoginMethod } from './types'
import { Redirect, useHistory, useParams } from 'react-router'
import { fetchToken, setToken } from '../../helpers/authentication'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { disableState, PasswordStatus } from '../Login'
import { PLURAL_ICON, PLURAL_MARK } from '../constants'

function LabelledInput({label, value, onChange, placeholder, width, type, modifier}) {
  return (
    <Box gap='xsmall' width={width || '300px'}>
      <Box direction='row' align='center'>
        <Box fill='horizontal'>
          <Text size='small' color='dark-4'>{label}</Text>
        </Box>
        <Box flex={false}>
          {modifier}
        </Box>
      </Box>
      <TextInput
        name={label}
        type={type}
        value={value || ''}
        onChange={({target: {value}}) => onChange(value)}
        placeholder={placeholder} />
    </Box>
  )
}

function LoginPortal({children}) {
  return (
    <Box height='100vh' fill='horizontal' direction='row'>
      <Box width='40%' fill='vertical' justify='center' align='center' background='plural-blk'>
        <img src={PLURAL_ICON} width='200px' />
      </Box>
      <Box fill align='center' justify='center'>
        {children}
      </Box>
    </Box>
  )
}

export function PasswordlessLogin() {
  let history = useHistory()
  const {token} = useParams()
  const [mutation, {error, loading}] = useMutation(PASSWORDLESS_LOGIN, {
    variables: {token},
    onCompleted: ({passwordlessLogin: {jwt}}) => {
      setToken(jwt)
      history.push(`/`)
    }
  })
  useEffect(() => {
    mutation()
  }, [])

  return (
    <LoginPortal>
      <Box gap='medium'>
        <Box gap='xsmall' align='center'>
          <img src={PLURAL_MARK} width='45px' />
          <Text size='large'>Magic Login</Text>
        </Box>
        {loading && <Text size='small' color='dark-3'>Validating your login token...</Text>}
        {error && <GqlError error={error} header='Error validating login' />}
      </Box>
    </LoginPortal>
  )
}

export function Login() {
  let history = useHistory()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [getLoginMethod, {data, loading: qLoading, error: qError}] = useLazyQuery(LOGIN_METHOD, {variables: {email}})

  const loginMethod = data && data.loginMethod && data.loginMethod.loginMethod
  const open = loginMethod === LoginMethod.PASSWORD
  const passwordless = loginMethod === LoginMethod.PASSWORDLESS

  const [mutation, {loading: mLoading, error}] = useMutation(LOGIN_MUTATION, {
    variables: { email, password },
    onCompleted: ({login: {jwt}}) => {
      setToken(jwt)
      history.push(`/`)
    }
  })

  useEffect(() => {
    if (fetchToken()) {
      history.push('/')
    }
  }, [])

  const submit = useCallback(() => open ? mutation() : getLoginMethod(), [mutation, getLoginMethod, open])

  const loading = qLoading || mLoading

  if (qError) return <Redirect to='/signup' />

  return (
    <LoginPortal>
      <Box gap='medium'>
        <Box gap='xsmall' align='center'>
          <img src={PLURAL_MARK} width='45px' />
          <Text size='large'>Welcome</Text>
          <Text size='small' color='dark-3'>{open ? 'good to see you again' : 'Tell us your email to get started'}</Text>
        </Box>
        {passwordless && (
          <Box>
            <Alert 
              status={AlertStatus.SUCCESS} 
              header='Check your email!' 
              description='Check your email to verify your identity and log in' />
          </Box>
        )}
        {!passwordless && (
          <Keyboard onEnter={submit}>
            <Form onSubmit={submit}>
              <Box gap='xsmall'>
                {error && <GqlError error={error} header='Login Failed' />}
                <LabelledInput 
                  label='Email'
                  value={email}
                  onChange={open ? null : setEmail} 
                  placeholder='you@example.com' />
                <Collapsible open={open} direction='vertical'>
                  <LabelledInput 
                    label='Password' 
                    type='password'
                    modifier={<Anchor onClick={() => history.push('/password-reset')} color='dark-6'>forgot your password?</Anchor>}
                    value={password}
                    onChange={setPassword}
                    placeholder='a strong password' />
                </Collapsible>
                <Button 
                  fill='horizontal' 
                  pad={{vertical: '8px'}} 
                  margin={{top: 'small'}}
                  label="Continue" loading={loading} onClick={submit} />
              </Box>
            </Form>
          </Keyboard>
        )}
      </Box>
    </LoginPortal>
  )
}

export function Signup() {
  let history = useHistory()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirm, setConfirm] = useState('')
  const [mutation, {loading, error}] = useMutation(LOGIN_MUTATION, {
    variables: { email, password, name },
    onCompleted: ({signup: {jwt}}) => {
      setToken(jwt)
      history.push(`/`)
    }
  })

  useEffect(() => {
    if (fetchToken()) {
      history.push('/')
    }
  }, [])

  const {disabled, reason} = disableState(password, confirm)

  return (
    <LoginPortal>
      <Box gap='medium'>
        <Box gap='xsmall' align='center'>
          <img src={PLURAL_MARK} width='45px' />
          <Text size='large'>Sign up to get started with plural</Text>
        </Box>
        <Keyboard onEnter={mutation}>
          <Form onSubmit={mutation}>
            <Box gap='xsmall'>
              {error && <GqlError error={error} header='Login Failed' />}
              <LabelledInput 
                label='Name' 
                value={name} 
                onChange={setName} 
                placeholder='Your name' />
              <LabelledInput 
                label='Email' 
                value={email} 
                onChange={setEmail} 
                placeholder='you@example.com' />
              <LabelledInput 
                label='Password' 
                value={password}
                type='password'
                onChange={setPassword}
                placeholder='a strong password' />
              <LabelledInput 
                label='Confirm Password' 
                value={confirm}
                type='password'
                onChange={setConfirm}
                placeholder='confirm your password' />
              <Box direction='row' align='center' justify='end' gap='small'>
                <PasswordStatus disabled={disabled} reason={reason} />
                <Button 
                  label="Sign Up" 
                  disabled={disabled}
                  loading={loading} 
                  onClick={mutation} />
              </Box>
            </Box>
          </Form>
        </Keyboard>
        <Box fill='horizontal' align='center' justify='center' direction='row' gap='xsmall'>
          <Text size='small' color='dark-6'>Already have an account?</Text>
          <Anchor onClick={() => history.push('/login')}>Login</Anchor>
        </Box>
      </Box>
    </LoginPortal>
  )
}