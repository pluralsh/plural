import {
  RefObject,
  createElement,
  forwardRef,
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
import { Divider, FormField, LoadingSpinner } from '@pluralsh/design-system'
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
  Img,
  Input,
} from 'honorable'
import { useResizeDetector } from 'react-resize-detector'

import {
  AcceptLoginDocument,
  PollLoginTokenDocument,
  useLoginMethodLazyQuery,
  useLoginMutation,
  useOauthUrlsQuery,
  usePasswordlessLoginMutation,
} from '../../generated/graphql'

import { WelcomeHeader } from '../utils/WelcomeHeader'

import { fetchToken, setToken } from '../../helpers/authentication'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { LOGIN_SIDEBAR_IMAGE, PLURAL_MARK_WHITE } from '../constants'
import { host } from '../../helpers/hostname'
import { useHistory } from '../../router'

import {
  METHOD_ICONS,
  saveChallenge,
  saveDeviceToken,
  wipeChallenge,
  wipeDeviceToken,
} from './utils'
import { LoginMethod } from './types'
import { finishedDeviceLogin } from './DeviceLoginNotif'

export const LabelledInput = forwardRef(({
  label,
  value,
  onChange,
  placeholder,
  type,
  caption,
  hint,
  error = undefined,
  required = false,
  disabled = false,
}: any,
ref) => (
  <FormField
    label={label}
    caption={caption}
    hint={hint}
    marginBottom="small"
    error={error}
    required={required}
  >
    <Input
      ref={ref}
      width="100%"
      name={label}
      type={type}
      value={value || ''}
      onChange={onChange && (({ target: { value } }) => onChange(value))}
      placeholder={placeholder}
      error={error}
      disabled={disabled}
    />
  </FormField>
))

const RIGHT_CONTENT_MAX_WIDTH = 480

export function LoginPortal({ children }: any) {
  return (
    <Flex height="100vh">
      {/* LEFT SIDE */}
      <Flex
        direction="column"
        align="center"
        background="fill-one"
        display-desktop-down="none"
        overflow="hidden"
        width={504}
        height="100%"
      >
        <Img
          src={LOGIN_SIDEBAR_IMAGE}
          width="100%"
          height="100%"
          objectFit="cover"
        />
      </Flex>
      {/* RIGHT SIDE */}
      <Flex
        overflow="auto"
        grow={1}
        shrink={1}
        padding="xxlarge"
      >
        <Div
          maxWidth={RIGHT_CONTENT_MAX_WIDTH}
          width="100%"
          marginVertical="auto"
          marginHorizontal="auto"
        >
          {children}
        </Div>
      </Flex>
    </Flex>
  )
}

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
  const { ref, width } = useResizeDetector({
    handleHeight: false,
  })
  const singleColumn = (width as number) < RIGHT_CONTENT_MAX_WIDTH

  return (
    <Div
      ref={ref}
      marginBottom="medium"
    >
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
                width={singleColumn ? '100%' : 'auto'}
              />
            ))}
          </Flex>
        </>
      )}
    </Div>
  )
}

type LoginState =
  | 'INITIAL'
  | 'CHECK_EMAIL'
  | 'CHECKING_EMAIL'
  | 'CHECK_PASSWORD'
  | 'CHECKING_PASSWORD'
  | 'PASSWORD_LOGIN'
  | 'PASSWORDLESS'
  | 'SIGNUP'

export function Login() {
  const [state, setState] = useState<LoginState>('INITIAL')
  const prevState = useRef<LoginState>('INITIAL')
  const history = useHistory()
  const client = useApolloClient()
  const location = useLocation()
  const jwt = fetchToken()
  const [ran, setRan] = useState(false)
  const { login_challenge: challenge, deviceToken } = queryString.parse(location.search)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
  const navigate = useNavigate()
  const passwordRef = useRef<HTMLElement>()
  const emailRef = useRef<HTMLElement>()

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

  const setInputFocus = (ref: RefObject<any>) => {
    requestAnimationFrame(() => {
      ref.current?.querySelector('input')?.focus()
    })
  }

  useEffect(() => {
    setInputFocus(emailRef)
  }, [])
  useEffect(() => {
    if (state !== prevState.current) {
      switch (state) {
      case 'INITIAL':
        setInputFocus(emailRef)
        break
      case 'CHECK_EMAIL':
        setState('CHECKING_EMAIL')
        console.log('setting to CHECKING_EMAIL')
        getLoginMethod()
        break
      case 'CHECK_PASSWORD':
        loginMutation()
        setState('CHECKING_PASSWORD')
        break
      case 'PASSWORD_LOGIN':
        setInputFocus(passwordRef)
        break
      default:
        console.error("We shouldn't be here")
      }
    }
    prevState.current = state
  }, [getLoginMethod, loginMutation, state])

  useEffect(() => {
    if (state === 'SIGNUP') {
      navigate(`/signup${email ? `?email=${encodeURIComponent(email)}` : ''}`)
    }
  })

  useEffect(() => {
    console.log({ loginMethodLoading, loginMethodData, state })
    if (!loginMethodLoading && loginMethodData && state === 'CHECKING_EMAIL') {
      const loginMethod = loginMethodData?.loginMethod?.loginMethod

      if (loginMethod === LoginMethod.PASSWORD) {
        setState('PASSWORD_LOGIN')
      }
      else if (loginMethod === LoginMethod.PASSWORDLESS) {
        setState('PASSWORDLESS')
      }
      else {
        setState('SIGNUP')
      }
    }
  }, [loginMethodData, loginMethodLoading, state])

  useEffect(() => {
    if (state === 'CHECKING_EMAIL' && loginMethodError) {
      if (deviceToken) saveDeviceToken(deviceToken)
      setState('SIGNUP')
    }
  }, [deviceToken, loginMethodError, state])

  const loginMethod = loginMethodData?.loginMethod

  const { data: oAuthData } = useOauthUrlsQuery({
    variables: { host: host() },
  })

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

  const submit = useCallback(() => {
    console.log('submit')
    if (state === 'PASSWORD_LOGIN') {
      setState('CHECK_PASSWORD')
    }
    if (state === 'INITIAL') {
      setState('CHECK_EMAIL')
    }
  }, [state])

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
      <WelcomeHeader marginBottom="xlarge" />
      {state === 'PASSWORDLESS' && (
        <Div>
          <LoginPoller
            token={loginMethod?.token}
            challenge={challenge}
            deviceToken={deviceToken}
          />
        </Div>
      )}
      {state !== 'PASSWORDLESS' && (
        <>
          <Form onSubmit={submit}>
            {loginMError && (
              <Div marginBottom="medium">
                <GqlError
                  error={loginMError}
                  header="Login Failed"
                />
              </Div>
            )}
            <LabelledInput
              ref={emailRef}
              label="Email address"
              value={email}
              onChange={state === 'PASSWORD_LOGIN' ? undefined : setEmail}
              disabled={state === 'PASSWORD_LOGIN'}
              placeholder="Enter email address"
              caption={
                state === 'PASSWORD_LOGIN' ? (
                  <A
                    inline
                    onClick={() => {
                      setEmail('')
                      setState('INITIAL')
                    }}
                  >
                    change email
                  </A>
                ) : null
              }
            />
            <Collapsible
              open={state === 'PASSWORD_LOGIN'}
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
                  >
                    forgot your password?
                  </A>
                )}
                value={password}
                onChange={setPassword}
                placeholder="Enter password"
              />
            </Collapsible>
            <Button
              type="submit"
              width="100%"
              loading={loading}
            >
              Continue
            </Button>
          </Form>
          {!deviceToken && <OAuthOptions oauthUrls={oAuthData?.oauthUrls} />}
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

function OAuthOption({ url: { authorizeUrl, provider }, ...props }: any) {
  const icon = METHOD_ICONS[provider]

  return (
    <Button
      width={143}
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
  )
}

