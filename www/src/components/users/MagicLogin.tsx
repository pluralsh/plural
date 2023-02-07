import {
  RefObject,
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Box,
  Collapsible,
  Form,
  Text,
} from 'grommet'
import { Divider, LoadingSpinner } from '@pluralsh/design-system'
import { useApolloClient } from '@apollo/client'
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import queryString from 'query-string'
import {
  A,
  Button,
  Div,
  Flex,
  Icon,
} from 'honorable'

import styled from 'styled-components'

import {
  AcceptLoginDocument,
  LoginMethod,
  PollLoginTokenDocument,
  useLoginMethodLazyQuery,
  useLoginMutation,
  useOauthUrlsQuery,
  usePasswordlessLoginMutation,
} from '../../generated/graphql'

import { WelcomeHeader } from '../utils/WelcomeHeader'

import { fetchToken, setToken } from '../../helpers/authentication'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { PLURAL_MARK_WHITE } from '../constants'
import { host } from '../../helpers/hostname'
import { useHistory } from '../../router'

import { isMinViableEmail } from '../../utils/string'

import {
  METHOD_ICONS,
  saveChallenge,
  saveDeviceToken,
  wipeChallenge,
  wipeDeviceToken,
} from './utils'
import { finishedDeviceLogin } from './DeviceLoginNotif'
import { LabelledInput } from './LabelledInput'
import { LOGIN_BREAKPOINT, LoginPortal } from './LoginPortal'

export function PasswordlessLogin() {
  const { token } = useParams()
  const [mutation, { error, loading, data }] = usePasswordlessLoginMutation({
    variables: { token: token ?? '' },
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
          <Text size="large">Passwordless Login</Text>
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
  client
    .mutate({
      mutation: AcceptLoginDocument,
      variables: { challenge },
    })
    .then(({
      data: {
        acceptLogin: { redirectTo },
      },
    }) => {
      window.location = redirectTo
    })
    .catch(err => {
      console.error(err)
      wipeChallenge()
    })
}

function LoginPoller({ challenge, token, deviceToken }: any) {
  const history = useHistory()
  const client = useApolloClient()
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      client
        .mutate({
          mutation: PollLoginTokenDocument,
          variables: { token, deviceToken },
        })
        .then(({
          data: {
            loginToken: { jwt },
          },
        }) => {
          setToken(jwt)
          setSuccess(true)

          if (deviceToken) finishedDeviceLogin()

          if (challenge) {
            handleOauthChallenge(client, challenge)
          }
          else {
            history.navigate('/')
          }
        })
    }, 2000)

    return () => clearInterval(interval)
  }, [token, challenge, deviceToken, history, client])

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

const sortOrder = ['GITHUB', 'GITLAB', 'GOOGLE']

function sortOauthUrls(a, b) {
  return sortOrder.indexOf(a.provider) - sortOrder.indexOf(b.provider)
}

export function OAuthOptions({ oauthUrls }: any) {
  return (
    <Div marginBottom="medium">
      {oauthUrls && (
        <>
          <Divider
            text="Or continue with"
            color="text-xlight"
            backgroundColor="border"
            marginVertical="large"
            overline
          />
          <Flex
            direction="row"
            gap="large"
            justify="space-between"
            wrap="wrap"
            flexWrap="wrap"
          >
            {[...oauthUrls].sort(sortOauthUrls).map(url => (
              <OAuthOption
                key={url.provider}
                url={url}
                flexGrow={1}
              />
            ))}
          </Flex>
        </>
      )}
    </Div>
  )
}

type LoginState =
  | 'Initial'
  | 'CheckEmail'
  | 'CheckingEmail'
  | 'PwdLogin_CheckPwd'
  | 'PwdLogin_CheckingPwd'
  | 'PwdLogin'
  | 'PasswordlessLogin'
  | 'Signup'

const State = {
  Initial: 'Initial',
  CheckEmail: 'CheckEmail',
  CheckingEmail: 'CheckingEmail',
  PwdLogin: 'PwdLogin',
  PwdLogin_CheckPwd: 'PwdLogin_CheckPwd',
  PwdLogin_CheckingPwd: 'PwdLogin_CheckingPwd',
  PasswordlessLogin: 'PasswordlessLogin',
  Signup: 'Signup',
} as const satisfies Record<LoginState, LoginState>

const setInputFocus = (ref: RefObject<any>) => {
  requestAnimationFrame(() => {
    ref.current?.querySelector('input')?.focus()
  })
}

export function Login() {
  const [state, setState] = useState<LoginState>(State.Initial)
  const prevState = useRef<LoginState>(State.Initial)
  const history = useHistory()
  const client = useApolloClient()
  const location = useLocation()
  const jwt = fetchToken()
  const [ran, setRan] = useState(false)
  const { login_challenge: challenge, deviceToken } = queryString.parse(location.search)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const passwordRef = useRef<HTMLElement>()
  const emailRef = useRef<HTMLElement>()

  useEffect(() => {
    setInputFocus(emailRef)
  }, [])

  const [
    loginMethodQuery,
    {
      data: loginMethodData,
      loading: loginMethodLoading,
      error: loginMethodError,
    },
  ] = useLoginMethodLazyQuery()
  const getLoginMethod = useCallback(() => {
    loginMethodQuery({
      variables: { email, host: host() },
    })
  }, [email, loginMethodQuery])

  const [loginMutation, { loading: loginMLoading, error: loginMError }]
    = useLoginMutation({
      variables: {
        email,
        password,
        deviceToken: typeof deviceToken === 'string' ? deviceToken : undefined,
      },
      onCompleted: ({ login }) => {
        setToken(login?.jwt)
        if (deviceToken) finishedDeviceLogin()
        if (challenge) {
          handleOauthChallenge(client, challenge)
        }
        else {
          history.navigate('/')
        }
      },
    })

  useEffect(() => {
    if (state !== prevState.current) {
      switch (state) {
      case State.Initial:
        setInputFocus(emailRef)
        break
      case State.CheckEmail:
        getLoginMethod()
        setState(State.CheckingEmail)
        break
      case State.PwdLogin_CheckPwd:
        loginMutation()
        setState(State.PwdLogin_CheckingPwd)
        break
      case State.PwdLogin:
        setInputFocus(passwordRef)
        break
      default:
        break
      }
    }
    prevState.current = state
  }, [getLoginMethod, loginMutation, state])

  useEffect(() => {
    if (state === State.Signup) {
      navigate('/signup', { state: { email } })
    }
  })

  useEffect(() => {
    if (state === State.PwdLogin_CheckingPwd && loginMError) {
      setState(State.PwdLogin)
      setPassword('')
    }
  }, [loginMError, state])
  const passwordErrorMsg
    = loginMError?.message === 'invalid password' ? 'Invalid password' : undefined
  const loginError = !passwordErrorMsg && loginMError

  useEffect(() => {
    if (
      !loginMethodLoading
      && loginMethodData
      && state === State.CheckingEmail
    ) {
      const loginMethod = loginMethodData?.loginMethod?.loginMethod

      if (!loginMethod) {
        setState(State.Signup)
      }
      else if (loginMethod === LoginMethod.Password) {
        setState(State.PwdLogin)
      }
      else if (loginMethod === LoginMethod.Passwordless) {
        setState(State.PasswordlessLogin)
      }
    }
  }, [loginMethodData, loginMethodLoading, state])

  useEffect(() => {
    wipeChallenge()
    wipeDeviceToken()

    if (challenge) saveChallenge(challenge)

    if (loginMethodData?.loginMethod?.authorizeUrl) {
      if (deviceToken) saveDeviceToken(deviceToken)
      window.location = loginMethodData.loginMethod.authorizeUrl as any
    }
  }, [loginMethodData, challenge, deviceToken])

  useEffect(() => {
    if (jwt && challenge && !ran) {
      setRan(true)
      handleOauthChallenge(client, challenge)
    }
    else if (!deviceToken && !challenge && jwt) {
      history.navigate('/')
    }
  }, [challenge, deviceToken, history, client, jwt, ran, setRan])

  useEffect(() => {
    if (state === State.CheckingEmail && loginMethodError) {
      if (deviceToken) saveDeviceToken(deviceToken)
      setState(State.Signup)
    }
  }, [deviceToken, loginMethodError, state])

  const loginMethod = loginMethodData?.loginMethod

  const { data: oAuthData } = useOauthUrlsQuery({
    variables: { host: host() },
  })

  const isPasswordLogin
    = state === State.PwdLogin
    || state === State.PwdLogin_CheckingPwd
    || state === State.PwdLogin_CheckPwd
  const disableSubmit = isPasswordLogin
    ? password.length === 0
    : !isMinViableEmail(email)

  const submit = useCallback(() => {
    if (disableSubmit) {
      return
    }
    switch (state) {
    case State.PwdLogin:
      setState(State.PwdLogin_CheckPwd)
      break
    case State.Initial:
      setState(State.CheckEmail)
      break
    default:
      break
    }
  }, [disableSubmit, state])

  const loading = loginMethodLoading || loginMLoading

  // This is to ensure that if both login token and login challenge are
  // available, user will not see the login view while oauth challenge
  // and redirect to the oauth consent happen.
  if (jwt && challenge) {
    return (
      <Flex
        grow={1}
        justify="center"
        align="center"
      >
        <LoadingSpinner />
      </Flex>
    )
  }

  return (
    <LoginPortal>
      <Div>
        <WelcomeHeader marginBottom="xlarge" />
        {state === State.PasswordlessLogin && (
          <Div>
            <LoginPoller
              token={loginMethod?.token}
              challenge={challenge}
              deviceToken={deviceToken}
            />
          </Div>
        )}
        {state !== State.PasswordlessLogin && (
          <>
            <Form onSubmit={submit}>
              {loginError && (
                <Div marginBottom="medium">
                  <GqlError
                    error={loginError}
                    header="Login Failed"
                  />
                </Div>
              )}
              <LabelledInput
                ref={emailRef}
                label="Email address"
                value={email}
                onChange={isPasswordLogin ? undefined : setEmail}
                disabled={isPasswordLogin}
                placeholder="Enter email address"
                caption={
                  isPasswordLogin ? (
                    <A
                      inline
                      onClick={() => {
                        setEmail('')
                        setState(State.Initial)
                      }}
                    >
                      change email
                    </A>
                  ) : null
                }
              />
              <Collapsible
                open={state === State.PwdLogin}
                direction="vertical"
              >
                <LabelledInput
                  ref={passwordRef}
                  label="Password"
                  type="password"
                  caption={(
                    <A
                      inline
                      as={Link}
                      to="/password-reset"
                      onClick={e => {
                        e.preventDefault()
                        navigate('/password-reset', { state: { email } })
                      }}
                    >
                      forgot your password?
                    </A>
                  )}
                  hint={passwordErrorMsg}
                  error={!!passwordErrorMsg}
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter password"
                />
              </Collapsible>
              <Button
                type="submit"
                width="100%"
                loading={loading}
                disabled={disableSubmit}
              >
                Continue
              </Button>
            </Form>
            {!deviceToken && <OAuthOptions oauthUrls={oAuthData?.oauthUrls} />}
          </>
        )}
      </Div>
    </LoginPortal>
  )
}

const providerToName = {
  github: 'GitHub',
  google: 'Google',
  gitlab: 'GitLab',
}

export const FlexAtBreak = styled.div(_ => ({
  width: '100%',
  [LOGIN_BREAKPOINT]: {
    flex: '1 0',
    width: 'auto',
  },
}))

function OAuthOption({ url: { authorizeUrl, provider }, ...props }: any) {
  const icon = METHOD_ICONS[provider]

  return (
    <FlexAtBreak>
      <Button
        width="100%"
        height={48}
        secondary
        as={A}
        _hover={{ textDecoration: 'none' }}
        href={authorizeUrl}
        startIcon={(
          <Icon filter="grayscale(1)">
            {createElement(icon, { size: 20, fullColor: true })}
          </Icon>
        )}
        {...props}
      >
        {providerToName[provider.toLowerCase()]}
      </Button>
    </FlexAtBreak>
  )
}
