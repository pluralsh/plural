import {
  createElement, useCallback, useEffect, useState,
} from 'react'
import {
  Box, Collapsible, Form, Keyboard, Text,
} from 'grommet'
import { Divider, FormField, StatusOkIcon } from 'pluralsh-design-system'
import {
  useApolloClient, useLazyQuery, useMutation, useQuery,
} from '@apollo/client'
import {
  Navigate, useLocation, useNavigate, useParams,
} from 'react-router-dom'
import queryString from 'query-string'
import {
  A, Article, Button, Div, Flex, H1, H2, Icon, Img, Input, P,
} from 'honorable'

import { fetchToken, setToken } from '../../helpers/authentication'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { disableState } from '../Login'
import { PLURAL_FULL_LOGO_WHITE, PLURAL_MARK_WHITE } from '../constants'
import { ACCEPT_LOGIN } from '../oidc/queries'
import { host } from '../../helpers/hostname'

import {
  getDeviceToken, saveChallenge, saveDeviceToken, wipeChallenge, wipeDeviceToken,
} from './utils'
import { LoginMethod } from './types'
import {
  LOGIN_METHOD,
  LOGIN_MUTATION,
  OAUTH_URLS,
  PASSWORDLESS_LOGIN,
  POLL_LOGIN_TOKEN,
  SIGNUP_MUTATION,
} from './queries'
import { METHOD_ICONS } from './OauthEnabler'
import { finishedDeviceLogin } from './DeviceLoginNotif'

export function LabelledInput({
  label, value, onChange, placeholder, type, caption, hint,
}) {
  return (
    <FormField
      label={label}
      caption={caption}
      hint={hint}
      marginBottom="medium"
    >
      <Input
        width="100%"
        name={label}
        type={type}
        value={value || ''}
        onChange={onChange && (({ target: { value } }) => onChange(value))}
        placeholder={placeholder}
      />
    </FormField>
  )
}

export function LoginPortal({ children }) {
  return (
    <Flex height="100vh">
      {/* LEFT SIDE */}
      <Flex
        direction="column"
        align="center"
        background="fill-one"
        display-tablet="none"
        padding="xxlarge"
        overflowY="auto"
        overflowX="hidden"
        height="100%"
      >
        <Flex
          grow={1}
          width={408}
          direction="column"
        >
          {/* LOGOTYPE */}
          <Flex
            paddingBottom="xxxlarge"
            align="center"
            gap="xxsmall"
          >
            <Img
              src={PLURAL_FULL_LOGO_WHITE}
              height={48}
            />
          </Flex>
          {/* HIGHLIGHTS */}
          <Flex
            grow={1}
            direction="column"
            justify="center"
          >
            <LoginHighlight
              title="Built for the cloud."
              marginBottom="xxlarge"
            >
              Plural is optimized for you to bring your own cloud and run on top of Kubernetes with the ideal cluster
              distribution.
            </LoginHighlight>
            <LoginHighlight
              title="Developer friendly."
              marginBottom="xxlarge"
            >
              Use our simple GitOps driven workflow for deploying and managing applications, and a centralized
              configuration in a single repo.
            </LoginHighlight>
            <LoginHighlight title="Batteries included.">
              Baked-in observability, logging, auditing, and user auth.
            </LoginHighlight>
          </Flex>
        </Flex>
      </Flex>
      {/* RIGHT SIDE */}
      <Flex
        overflow="auto"
        grow={1}
        padding="xxlarge"
      >
        <Div
          width="480px"
          marginVertical="auto"
          marginHorizontal="auto"
        >
          {children}
        </Div>
      </Flex>
    </Flex>
  )
}

function LoginHighlight({ title, children, ...props }) {
  return (
    <Flex
      align="flex-start"
      {...props}
    >
      <StatusOkIcon
        size={16}
        marginTop="xxsmall"
        backgroundColor="white"
        borderRadius="100%"
        outline="2px solid fill-one" // cover the white background with outline that can be seen on the outside of the icon
        outlineOffset={-1}
        color="border-primary"
      />
      <Article marginLeft="medium">
        <H2
          subtitle1
          marginBottom="xxsmall"
        >
          {title}
        </H2>
        <P
          body2
          color="text-light"
        >
          {children}
        </P>
      </Article>
    </Flex>
  )
}

export function PasswordlessLogin() {
  const { token } = useParams()
  const [mutation, { error, loading, data }] = useMutation(PASSWORDLESS_LOGIN, {
    variables: { token },
  })

  useEffect(() => {
    mutation()
  }, [mutation])

  return (
    <LoginPortal>
      <Box gap="medium">
        <Box
          gap="xsmall"
          align="center"
        >
          <img
            src={PLURAL_MARK_WHITE}
            width="45px"
          />
          <Text size="large">
            Passwordless Login
          </Text>
        </Box>
        {loading && (
          <Text
            size="small"
            color="dark-3"
          >
            Validating your login token...
          </Text>
        )}
        {error && (
          <GqlError
            error={error}
            header="Error validating login"
          />
        )}
        {data && (
          <Alert
            status={AlertStatus.SUCCESS}
            header="You're now logged in!"
            description="Navigate back to wherever you initiated the login to begin using plural."
          />
        )}
      </Box>
    </LoginPortal>
  )
}

export function handleOauthChallenge(client, challenge) {
  client.mutate({
    mutation: ACCEPT_LOGIN,
    variables: { challenge },
  }).then(({ data: { acceptLogin: { redirectTo } } }) => {
    window.location = redirectTo
  })
}

function LoginPoller({ challenge, token, deviceToken }) {
  const navigate = useNavigate()
  const client = useApolloClient()
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      client.mutate({
        mutation: POLL_LOGIN_TOKEN,
        variables: { token, deviceToken },
      }).then(({ data: { loginToken: { jwt } } }) => {
        setToken(jwt)
        setSuccess(true)

        if (deviceToken) finishedDeviceLogin()

        if (challenge) {
          handleOauthChallenge(client, challenge)
        }
        else {
          navigate('/')
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [token, challenge, deviceToken, navigate, client])

  if (success) {
    return (
      <Alert
        status={AlertStatus.SUCCESS}
        header="Login Verified!"
        description="we'll redirect you to the app shortly"
      />
    )
  }

  return (
    <Alert
      status={AlertStatus.SUCCESS}
      header="Check your email!"
      description="Check your email to verify your identity and log in"
    />
  )
}

export function Login() {
  const navigate = useNavigate()
  const client = useApolloClient()
  const location = useLocation()
  const { login_challenge: challenge, deviceToken } = queryString.parse(location.search)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [getLoginMethod, { data, loading: qLoading, error: qError }] = useLazyQuery(LOGIN_METHOD, {
    variables: { email, host: host() },
  })

  const loginMethod = data && data.loginMethod && data.loginMethod.loginMethod
  const open = loginMethod === LoginMethod.PASSWORD
  const passwordless = loginMethod === LoginMethod.PASSWORDLESS

  const { data: oAuthData } = useQuery(OAUTH_URLS, { variables: { host: host() } })

  const [mutation, { loading: mLoading, error }] = useMutation(LOGIN_MUTATION, {
    variables: { email, password, deviceToken },
    onCompleted: ({ login: { jwt } }) => {
      setToken(jwt)
      if (deviceToken) finishedDeviceLogin()
      if (challenge) {
        handleOauthChallenge(client, challenge)
      }
      else {
        navigate('/')
      }
    },
  })

  useEffect(() => {
    wipeChallenge()
    wipeDeviceToken()

    if (data && data.loginMethod && data.loginMethod.authorizeUrl) {
      if (challenge) saveChallenge(challenge)
      if (deviceToken) saveDeviceToken(deviceToken)
      window.location = data.loginMethod.authorizeUrl
    }
  }, [data, challenge, deviceToken])

  useEffect(() => {
    const jwt = fetchToken()

    if (jwt && challenge) {
      handleOauthChallenge(client, challenge)
    }
    else if (!deviceToken && jwt) {
      navigate('/')
    }
  }, [challenge, deviceToken, navigate, client])

  const submit = useCallback(() => (open ? mutation() : getLoginMethod()), [mutation, getLoginMethod, open])

  const loading = qLoading || mLoading

  if (qError) {
    if (deviceToken) saveDeviceToken(deviceToken)

    return (
      <Navigate
        to="/signup"
        state={{ email }}
      />
    )
  }

  return (
    <LoginPortal>
      <WelcomeHeader />
      {passwordless && (
        <Div>
          <LoginPoller
            token={data.loginMethod.token}
            challenge={challenge}
            deviceToken={deviceToken}
          />
        </Div>
      )}
      {!passwordless && (
        <>
          <Keyboard onEnter={submit}>
            <Form onSubmit={submit}>
              {error && (
                <Div marginBottom="medium">
                  <GqlError
                    error={error}
                    header="Login Failed"
                  />
                </Div>
              )}
              <LabelledInput
                label="Email address"
                value={email}
                onChange={open ? null : setEmail}
                placeholder="Enter email address"
              />
              <Collapsible
                open={open}
                direction="vertical"
              >
                <LabelledInput
                  label="Password"
                  type="password"
                  caption={(
                    <A
                      inline
                      onClick={() => navigate('/password-reset')}
                    >forgot your password?
                    </A>
                  )}
                  value={password}
                  onChange={setPassword}
                  placeholder="a strong password"
                />
              </Collapsible>
              <Button
                width="100%"
                loading={loading}
                onClick={submit}
              >
                Continue
              </Button>
            </Form>
          </Keyboard>
          {!deviceToken && (
            <>
              <Divider
                text="OR CONTINUE WITH"
                color="text-xlight"
                backgroundColor="border"
                marginVertical="large"
                overline
              />
              <Flex
                direction="row"
                gap="large"
                justify="space-between"
              >
                {oAuthData && oAuthData.oauthUrls.map(url => (
                  <OAuthOption
                    key={url.provider}
                    url={url}
                    marginBottom="medium"
                  />
                ))}
              </Flex>
            </>
          )}
        </>
      )}
    </LoginPortal>
  )
}

const providerToName = {
  github: 'GitHub',
  google: 'Google',
  gitlab: 'GitLab',
}

function OAuthOption({ url: { authorizeUrl, provider }, ...props }) {
  const icon = METHOD_ICONS[provider]

  return (
    <Button
      width={143}
      height={48}
      secondary
      onClick={() => {
        window.location = authorizeUrl
      }}
      startIcon={(
        <Icon>
          {createElement(icon, { size: '20px', color: provider.toLowerCase() === 'github' ? 'white' : 'plain' })}
        </Icon>
      )}
      {...props}
    >
      {providerToName[provider.toLowerCase()]}
    </Button>
  )
}

export function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(location?.state?.email || '')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [account, setAccount] = useState('')
  const [confirm, setConfirm] = useState('')
  const deviceToken = getDeviceToken()
  const [mutation, { loading, error }] = useMutation(SIGNUP_MUTATION, {
    variables: { attributes: { email, password, name }, account: { name: account }, deviceToken },
    onCompleted: ({ signup: { jwt } }) => {
      if (deviceToken) finishedDeviceLogin()
      setToken(jwt)
      window.location = '/shell'
    },
  })
  const { data } = useQuery(OAUTH_URLS, { variables: { host: host() } })

  useEffect(() => {
    if (fetchToken()) {
      navigate('/')
    }
  }, [navigate])

  const { disabled, reason } = disableState(password, confirm, email)

  return (
    <LoginPortal>
      <WelcomeHeader />
      <Keyboard onEnter={mutation}>
        <Form onSubmit={mutation}>
          {error && (
            <Div marginBottom="medium">
              <GqlError
                error={error}
                header="Signup failed"
              />
            </Div>
          )}
          <LabelledInput
            label="Email address"
            value={email}
            onChange={setEmail}
            placeholder="Enter email address"
          />
          <LabelledInput
            label="Full name"
            value={name}
            onChange={setName}
            placeholder="Enter first and last name"
          />
          <LabelledInput
            label="Account name"
            value={account}
            onChange={setAccount}
            placeholder="Enter account name (must be unique)"
          />
          <LabelledInput
            label="Password"
            value={password}
            type="password"
            onChange={setPassword}
            placeholder="Enter password"
            caption="10 character minimum"
            hint={reason === 'Password is too short' && (
              <P
                caption
                color="text-error"
              >
                Password is too short
              </P>
            )}
          />
          <LabelledInput
            label="Confirm password"
            value={confirm}
            type="password"
            onChange={setConfirm}
            placeholder="Enter password again"
            hint={reason === 'Passwords do not match' && (
              <P
                caption
                color="text-error"
              >
                Password doesn't match
              </P>
            )}
          />
          <Button
            primary
            width="100%"
            disabled={disabled}
            loading={loading}
            onClick={mutation}
          >
            Create account
          </Button>
        </Form>
      </Keyboard>
      <Divider
        text="OR CONTINUE WITH"
        color="text-xlight"
        backgroundColor="border"
        marginVertical="large"
        overline
      />
      <Flex
        direction="row"
        gap="large"
        justify="space-between"
      >
        {data && data.oauthUrls.map(url => (
          <OAuthOption
            key={url.provider}
            url={url}
            marginBottom="medium"
          />
        ))}
      </Flex>
      <P
        body2
        textAlign="center"
        marginTop="medium"
      >
        Already have an account?{' '}
        <A
          inline
          onClick={() => navigate('/login')}
        >
          Login
        </A>
      </P>
    </LoginPortal>
  )
}

function WelcomeHeader({ heading = 'Welcome to Plural', subheading = 'We\'re glad to see you here.' }) {
  return (
    <Div marginBottom="xxlarge">
      <H1 title1>
        {heading}
      </H1>
      <P body1>{subheading}</P>
    </Div>
  )
}
