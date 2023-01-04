import {
  createElement,
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  Box,
  Collapsible,
  Form,
  Keyboard,
  Text,
} from 'grommet'
import { Divider, FormField, LoadingSpinner } from '@pluralsh/design-system'
import {
  useApolloClient,
  useLazyQuery,
  useMutation,
  useQuery,
} from '@apollo/client'
import {
  Navigate,
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
  P,
} from 'honorable'
import { useResizeDetector } from 'react-resize-detector'
import useScript from 'react-script-hook'

import { WelcomeHeader } from '../utils/WelcomeHeader'

import { fetchToken, setToken } from '../../helpers/authentication'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { disableState } from '../Login'
import { LOGIN_SIDEBAR_IMAGE, PLURAL_MARK_WHITE } from '../constants'
import { ACCEPT_LOGIN } from '../oidc/queries'
import { host } from '../../helpers/hostname'
import { useHistory } from '../../router'

import {
  METHOD_ICONS,
  getDeviceToken,
  saveChallenge,
  saveDeviceToken,
  wipeChallenge,
  wipeDeviceToken,
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
import { finishedDeviceLogin } from './DeviceLoginNotif'

export function LabelledInput({
  label, value, onChange, placeholder, type, caption, hint, error = undefined, required = false, disabled = false,
}: any) {
  return (
    <FormField
      label={label}
      caption={caption}
      hint={hint}
      marginBottom="small"
      error={error}
      required={required}
    >
      <Input
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
  )
}

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
  }).catch(err => {
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

const sortOrder = [
  'GITHUB',
  'GITLAB',
  'GOOGLE',
]

function sortOauthUrls(a, b) {
  return sortOrder.indexOf(a.provider) - sortOrder.indexOf(b.provider)
}

function OAuthOptions({ oauthUrls }: any) {
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

export function Login() {
  const history = useHistory()
  const navigate = useNavigate()
  const client = useApolloClient()
  const location = useLocation()
  const jwt = fetchToken()
  const [ran, setRan] = useState(false)
  const { login_challenge: challenge, deviceToken } = queryString.parse(location.search)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [getLoginMethod, { data, loading: qLoading, error: qError }] = useLazyQuery(LOGIN_METHOD, {
    variables: { email, host: host() },
  })

  const loginMethod = data?.loginMethod?.loginMethod
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
        history.navigate('/')
      }
    },
  })

  useEffect(() => {
    wipeChallenge()
    wipeDeviceToken()

    if (challenge) saveChallenge(challenge)

    if (data?.loginMethod?.authorizeUrl) {
      if (deviceToken) saveDeviceToken(deviceToken)
      window.location = data.loginMethod.authorizeUrl
    }
  }, [data, challenge, deviceToken])

  useEffect(() => {
    if (jwt && challenge && !ran) {
      setRan(true)
      handleOauthChallenge(client, challenge)
    }
    else if (!deviceToken && !challenge && jwt) {
      history.navigate('/')
    }
  }, [challenge, deviceToken, history, client, jwt, ran, setRan])

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
                  placeholder="Enter password"
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
            <OAuthOptions oauthUrls={oAuthData?.oauthUrls} />
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

function OAuthOption({ url: { authorizeUrl, provider }, ...props }: any) {
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

export function Signup() {
  const history = useHistory()
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
      history.navigate('/shell')
    },
  })
  const { data } = useQuery(OAUTH_URLS, { variables: { host: host() } })

  useEffect(() => {
    if (fetchToken()) {
      history.navigate('/')
    }
  }, [history])
  // we should probably move hubspot to loaded similarly to with the other analytic tools and setup with cookiebot
  useScript({ src: 'https://js.hs-scripts.com/22363579.js' })

  // @ts-expect-error
  const { disabled, reason } = disableState(password, confirm, email)

  return (
    <LoginPortal>
      <WelcomeHeader marginBottom="xxlarge" />
      <Keyboard onEnter={() => mutation()}>
        <Form onSubmit={() => mutation()}>
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
            onClick={() => mutation()}
          >
            Create account
          </Button>
        </Form>
      </Keyboard>
      <OAuthOptions oauthUrls={data?.oauthUrls} />
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
      <P
        body2
        textAlign="center"
        marginTop="xxsmall"
      >
        <A
          inline
          onClick={() => {
            (window as any)?._hsp?.push(['showBanner'])
          }}
        >
          Cookie settings
        </A>
      </P>
    </LoginPortal>
  )
}
