import { useApolloClient } from '@apollo/client'
import { Button, Divider, Flex, LoadingSpinner } from '@pluralsh/design-system'
import queryString from 'query-string'
import {
  RefObject,
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

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

import { fetchToken, setAuthFromUser } from '../../helpers/authentication'
import { host } from '../../helpers/hostname'
import { PLURAL_MARK_WHITE } from '../constants'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import {
  Body2P,
  InlineLinkButtonSC,
  InlineLinkSC,
  Subtitle1H1,
} from '../utils/Typography'

import { getLocalReturnUrl } from './utils'
import { isValidEmail } from '../../utils/email'

import { finishedDeviceLogin } from './DeviceLoginNotif'
import { LabelledInput } from './LabelledInput'
import { LOGIN_BREAKPOINT, LoginPortal } from './LoginPortal'
import {
  METHOD_ICONS,
  saveChallenge,
  saveDeviceToken,
  wipeChallenge,
  wipeDeviceToken,
} from './utils'

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
      <Flex
        direction="column"
        gap="medium"
      >
        <Flex
          direction="column"
          gap="xsmall"
          align="center"
        >
          <img
            src={PLURAL_MARK_WHITE}
            width="45px"
          />
          <Subtitle1H1 as="p">Passwordless Login</Subtitle1H1>
        </Flex>
        {loading && (
          <Body2P $color="text-light">Validating your login token...</Body2P>
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
      </Flex>
    </LoginPortal>
  )
}

export function handleOauthChallenge(client, challenge) {
  client
    .mutate({
      mutation: AcceptLoginDocument,
      variables: { challenge },
    })
    .then(
      ({
        data: {
          acceptLogin: { redirectTo },
        },
      }) => {
        window.location = redirectTo
      }
    )
    .catch((err) => {
      console.error(err)
      wipeChallenge()
    })
}

function LoginPoller({ challenge, token, deviceToken }: any) {
  const navigate = useNavigate()
  const client = useApolloClient()
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      client
        .mutate({
          mutation: PollLoginTokenDocument,
          variables: { token, deviceToken },
        })
        .then(({ data: { loginToken } }) => {
          setAuthFromUser(loginToken)
          setSuccess(true)

          if (deviceToken) finishedDeviceLogin()

          if (challenge) {
            handleOauthChallenge(client, challenge)
          } else {
            navigate(getLocalReturnUrl())
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
  const theme = useTheme()

  return (
    <div css={{ marginBottom: theme.spacing.medium }}>
      {oauthUrls && (
        <>
          <Divider
            text="Or continue with"
            color="text-xlight"
            backgroundColor="border"
            marginTop="large"
            marginBottom="large"
          />
          <OAuthGridSC>
            {[...oauthUrls].sort(sortOauthUrls).map((url) => (
              <OAuthOption
                key={url.provider}
                url={url}
              />
            ))}
          </OAuthGridSC>
        </>
      )}
    </div>
  )
}

type LoginState =
  | 'Initial'
  | 'CheckEmail'
  | 'CheckingEmail'
  | 'PwdLogin_CheckingPwd'
  | 'PwdLogin'
  | 'PasswordlessLogin'
  | 'Signup'

const State = {
  Initial: 'Initial',
  CheckEmail: 'CheckEmail',
  CheckingEmail: 'CheckingEmail',
  PwdLogin: 'PwdLogin',
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
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="6LcKLkQqAAAAABfRRfhQGp3c0rcytvDzcx8cddcq"
      language="en"
    >
      <LoginInternal />
    </GoogleReCaptchaProvider>
  )
}

function LoginInternal() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [state, setState] = useState<LoginState>(State.Initial)
  const prevState = useRef<LoginState>(State.Initial)
  const client = useApolloClient()
  const location = useLocation()
  const jwt = fetchToken()
  const [ran, setRan] = useState(false)
  const { login_challenge: challenge, deviceToken } = queryString.parse(
    location.search
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const passwordRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLDivElement>(null)

  const { executeRecaptcha } = useGoogleReCaptcha()
  const [isVerifyingCaptcha, setIsVerifyingCaptcha] = useState(false)
  const [captchaError, setCaptchaError] = useState<string>()
  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      setCaptchaError('reCAPTCHA is still loading. Please try again.')

      return undefined
    }

    setIsVerifyingCaptcha(true)
    setCaptchaError(undefined)

    try {
      return await executeRecaptcha('login')
    } catch (_) {
      setCaptchaError('Unable to verify reCAPTCHA. Please try again.')

      return undefined
    } finally {
      setIsVerifyingCaptcha(false)
    }
  }, [executeRecaptcha])

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

  const [loginMutation, { loading: loginMLoading, error: loginMError }] =
    useLoginMutation({
      onCompleted: ({ login }) => {
        setAuthFromUser(login)
        if (deviceToken) finishedDeviceLogin()
        if (challenge) {
          handleOauthChallenge(client, challenge)
        } else {
          navigate(getLocalReturnUrl())
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
        case State.PwdLogin:
          setInputFocus(passwordRef)
          break
        default:
          break
      }
    }
    prevState.current = state
  }, [getLoginMethod, state])

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
  const passwordErrorMsg =
    loginMError?.message === 'invalid password' ? 'Invalid password' : undefined
  const loginError = !passwordErrorMsg && loginMError

  useEffect(() => {
    if (
      !loginMethodLoading &&
      loginMethodData &&
      state === State.CheckingEmail
    ) {
      const loginMethod = loginMethodData?.loginMethod?.loginMethod

      if (!loginMethod) {
        setState(State.Signup)
      } else if (loginMethod === LoginMethod.Password) {
        setState(State.PwdLogin)
      } else if (loginMethod === LoginMethod.Passwordless) {
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
    } else if (!deviceToken && !challenge && jwt) {
      navigate(getLocalReturnUrl())
    }
  }, [challenge, deviceToken, history, client, jwt, ran, setRan])

  useEffect(() => {
    if (state === State.CheckingEmail && loginMethodError) {
      if (deviceToken) saveDeviceToken(deviceToken)
      setState(State.Signup)
    }
  }, [deviceToken, loginMethodError, state])

  const loginMethod = loginMethodData?.loginMethod

  const { data: oAuthData } = useOauthUrlsQuery({ variables: { host: host() } })

  const isPasswordLogin =
    state === State.PwdLogin || state === State.PwdLogin_CheckingPwd
  const disableSubmit = isPasswordLogin
    ? password.length === 0 || isVerifyingCaptcha || !executeRecaptcha
    : !isValidEmail(email)
  const hintMessage = captchaError
    ? captchaError
    : isPasswordLogin && !executeRecaptcha
      ? 'Loading reCAPTCHA...'
      : undefined
  const passwordHint = passwordErrorMsg || hintMessage
  const passwordError = !!passwordErrorMsg || !!captchaError

  const submitPasswordLogin = useCallback(async () => {
    const captcha = await handleReCaptchaVerify()
    if (!captcha) return

    setState(State.PwdLogin_CheckingPwd)
    loginMutation({
      variables: {
        email,
        password,
        deviceToken: typeof deviceToken === 'string' ? deviceToken : undefined,
        captcha,
      },
    }).catch(() => undefined)
  }, [
    deviceToken,
    email,
    handleReCaptchaVerify,
    loginMutation,
    password,
    setState,
  ])

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault()
      if (disableSubmit) {
        return
      }
      switch (state) {
        case State.PwdLogin:
          submitPasswordLogin()
          break
        case State.Initial:
          setState(State.CheckEmail)
          break
        default:
          break
      }
    },
    [disableSubmit, state, submitPasswordLogin]
  )

  const loading = loginMethodLoading || loginMLoading || isVerifyingCaptcha

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
      <div>
        <div css={{ marginBottom: theme.spacing.xlarge }}>
          <WelcomeHeader />
        </div>
        {state === State.PasswordlessLogin && (
          <div>
            <LoginPoller
              token={loginMethod?.token}
              challenge={challenge}
              deviceToken={deviceToken}
            />
          </div>
        )}
        {state !== State.PasswordlessLogin && (
          <>
            <form onSubmit={onSubmit}>
              {loginError && (
                <div css={{ marginBottom: theme.spacing.medium }}>
                  <GqlError
                    error={loginError}
                    header="Login Failed"
                  />
                </div>
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
                    <InlineLinkButtonSC
                      type="button"
                      onClick={() => {
                        setEmail('')
                        setState(State.Initial)
                      }}
                    >
                      change email
                    </InlineLinkButtonSC>
                  ) : null
                }
              />
              {state === State.PwdLogin && (
                <LabelledInput
                  ref={passwordRef}
                  label="Password"
                  type="password"
                  caption={
                    <InlineLinkSC
                      to="/password-reset"
                      onClick={(e) => {
                        e.preventDefault()
                        navigate('/password-reset', { state: { email } })
                      }}
                    >
                      forgot your password?
                    </InlineLinkSC>
                  }
                  hint={passwordHint}
                  error={passwordError}
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter password"
                />
              )}
              <Button
                type="submit"
                width="100%"
                loading={loading}
                disabled={disableSubmit}
              >
                {isPasswordLogin ? 'Log in' : 'Continue'}
              </Button>
            </form>
            {!deviceToken && <OAuthOptions oauthUrls={oAuthData?.oauthUrls} />}
            <Body2P
              $color="text-light"
              css={{ textAlign: 'center' }}
            >
              Don&apos;t have an account?{' '}
              <InlineLinkSC
                to="/signup"
                state={{ email }}
              >
                Sign up for Plural
              </InlineLinkSC>
            </Body2P>
          </>
        )}
      </div>
    </LoginPortal>
  )
}

const providerToName = {
  github: 'GitHub',
  google: 'Google',
  gitlab: 'GitLab',
}

const OAuthGridSC = styled.div(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing.small,
  [LOGIN_BREAKPOINT]: {
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(0, 1fr)',
  },
}))

function OAuthOption({ url: { authorizeUrl, provider } }: any) {
  const icon = METHOD_ICONS[provider]

  provider = provider.toLowerCase()

  return (
    <Button
      data-phid={`signup-${provider}`}
      width="100%"
      height={44}
      secondary
      as="a"
      href={authorizeUrl}
      startIcon={createElement(icon, { size: 20, fullColor: true })}
    >
      {providerToName[provider]}
    </Button>
  )
}
