import React, { useCallback, useEffect, useState } from 'react'
import { Box, Form, Keyboard, TextInput, Collapsible, Text, Anchor } from 'grommet'
import { Button, Divider } from 'forge-core'
import { LOGIN_METHOD, LOGIN_MUTATION, OAUTH_URLS, PASSWORDLESS_LOGIN, POLL_LOGIN_TOKEN, SIGNUP_MUTATION } from './queries'
import { useApolloClient, useLazyQuery, useMutation, useQuery } from 'react-apollo'
import { LoginMethod } from './types'
import { Redirect, useHistory, useLocation, useParams } from 'react-router'
import { fetchToken, setToken } from '../../helpers/authentication'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { disableState, PasswordStatus } from '../Login'
import { PLURAL_ICON, PLURAL_MARK } from '../constants'
import { ACCEPT_LOGIN } from '../oidc/queries'
import queryString from 'query-string'
import { saveChallenge, saveDeviceToken, wipeChallenge, wipeDeviceToken } from './utils'
import { host } from '../../helpers/hostname'
import { METHOD_ICONS } from './OauthEnabler'
import { finishedDeviceLogin } from './DeviceLoginNotif'

export function LabelledInput({label, value, onChange, placeholder, width, type, modifier}) {
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
        onChange={onChange && (({target: {value}}) => onChange(value))}
        placeholder={placeholder} />
    </Box>
  )
}

export function LoginPortal({children, ...props}) {
  return (
    <Box height='100vh' fill='horizontal' direction='row'>
      <Box width='40%' fill='vertical' justify='center' align='center' background='plural-blk'>
        <img src={PLURAL_ICON} width='200px' />
      </Box>
      <Box style={{overflow: 'auto'}} fill align='center' justify='center'>
        <Box flex={false} {...props}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export function PasswordlessLogin() {
  const {token} = useParams()
  const [mutation, {error, loading, data}] = useMutation(PASSWORDLESS_LOGIN, {
    variables: {token}
  })

  useEffect(() => {
    mutation()
  }, [])

  return (
    <LoginPortal>
      <Box gap='medium'>
        <Box gap='xsmall' align='center'>
          <img src={PLURAL_MARK} width='45px' />
          <Text size='large'>Passwordless Login</Text>
        </Box>
        {loading && <Text size='small' color='dark-3'>Validating your login token...</Text>}
        {error && <GqlError error={error} header='Error validating login' />}
        {data && (
          <Alert 
            status={AlertStatus.SUCCESS} 
            header="You're now logged in!" 
            description="Navigate back to wherever you initiated the login to begin using plural." /> 
        )}
      </Box>
    </LoginPortal>
  )
}

export function handleOauthChallenge(client, challenge) {
  client.mutate({
    mutation: ACCEPT_LOGIN,
    variables: {challenge}
  }).then(({data: {acceptLogin: {redirectTo}}}) => {
    window.location = redirectTo
  })
}

function LoginPoller({challenge, token, deviceToken}) {
  let history = useHistory()
  const client = useApolloClient()
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      client.mutate({
        mutation: POLL_LOGIN_TOKEN,
        variables: {token, deviceToken}
      }).then(({data: {loginToken: {jwt}}}) => {
        setToken(jwt)
        setSuccess(true)
        deviceToken && finishedDeviceLogin()
        if (challenge) {
          handleOauthChallenge(client, challenge)
        } else {
          history.push('/')
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [token, challenge])

  if (success) {
    return (
      <Alert 
        status={AlertStatus.SUCCESS} 
        header='Login Verified!' 
        description="we'll redirect you to the app shortly" />
    )
  }

  return (
    <Alert 
      status={AlertStatus.SUCCESS} 
      header='Check your email!' 
      description='Check your email to verify your identity and log in' />
  )
}

export function Login() {
  let history = useHistory()
  const client = useApolloClient()
  const location = useLocation()
  const {login_challenge: challenge, deviceToken} = queryString.parse(location.search)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [getLoginMethod, {data, loading: qLoading, error: qError}] = useLazyQuery(LOGIN_METHOD, {
    variables: {email, host: host()}
  })

  const loginMethod = data && data.loginMethod && data.loginMethod.loginMethod
  const open = loginMethod === LoginMethod.PASSWORD
  const passwordless = loginMethod === LoginMethod.PASSWORDLESS

  const [mutation, {loading: mLoading, error}] = useMutation(LOGIN_MUTATION, {
    variables: { email, password, deviceToken },
    onCompleted: ({login: {jwt}}) => {
      setToken(jwt)
      deviceToken && finishedDeviceLogin()
      if (challenge) {
        handleOauthChallenge(client, challenge)
      } else {
        history.push(`/`)
      }
    }
  })

  useEffect(() => {
    wipeChallenge()
    wipeDeviceToken()
    if (data && data.loginMethod.authorizeUrl) {
      if (challenge) saveChallenge(challenge)
      if (deviceToken) saveDeviceToken(deviceToken)
      window.location = data.loginMethod.authorizeUrl
    }
  }, [data])

  useEffect(() => {
    const jwt = fetchToken()
    if (jwt && challenge) {
      handleOauthChallenge(client, challenge)
    } else if (!deviceToken && jwt) {
      history.push('/')
    }
  }, [challenge])

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
            <LoginPoller 
              token={data.loginMethod.token} 
              challenge={challenge}
              deviceToken={deviceToken} />
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

const WIDTH = '350px'

function OAuthOption({url: {authorizeUrl, provider}}) {
  const icon = METHOD_ICONS[provider]

  return (
    <Box border round='xsmall' align='center' justify='center' 
         direction='row' gap='small' fill='horizontal' pad={{vertical: '7px'}}
         hoverIndicator='tone-light' onClick={() => { window.location = authorizeUrl }}>
      {React.createElement(icon, {size: 'medium', color: 'plain'})}
      <Text size='small'>Sign up with {provider.toLowerCase()}</Text>
    </Box>
  )
}

export function Signup() {
  let history = useHistory()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [account, setAccount] = useState('')
  const [confirm, setConfirm] = useState('')
  const [mutation, {loading, error}] = useMutation(SIGNUP_MUTATION, {
    variables: { attributes: {email, password, name}, account: {name: account} },
    onCompleted: ({signup: {jwt}}) => {
      setToken(jwt)
      history.push(`/`)
    }
  })
  const {data} = useQuery(OAUTH_URLS, {variables: {host: host()}})

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
        <Box gap='xsmall' justify='center' gap='xsmall'>
          {data && data.oauthUrls.map((url) => <OAuthOption key={url.provider} url={url} />)}
        </Box> 
        <Divider text='Or' margin='0px' fontWeight={400} />
        <Keyboard onEnter={mutation}>
          <Form onSubmit={mutation}>
            <Box gap='xsmall' width={WIDTH}>
              {error && <GqlError error={error} header='Login Failed' />}
              <LabelledInput 
                label='Account'
                value={account} 
                width={WIDTH}
                onChange={setAccount} 
                placeholder='The name of your account (must be unique)' />
              <LabelledInput 
                label='Name'
                value={name} 
                width={WIDTH}
                onChange={setName} 
                placeholder='Your name' />
              <LabelledInput 
                label='Email' 
                value={email} 
                width={WIDTH}
                onChange={setEmail} 
                placeholder='you@example.com' />
              <LabelledInput 
                label='Password' 
                value={password}
                width={WIDTH}
                type='password'
                onChange={setPassword}
                placeholder='a strong password' />
              <LabelledInput 
                label='Confirm Password' 
                value={confirm}
                width={WIDTH}
                type='password'
                onChange={setConfirm}
                placeholder='confirm your password' />
              <Box direction='row' align='center' justify='end' gap='small' margin={{top: 'small'}}>
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