import {
  ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Form } from 'grommet'
import { Link, useLocation } from 'react-router-dom'
import {
  A,
  Button,
  Div,
  Flex,
  P,
} from 'honorable'

import { useTheme } from 'styled-components'

import { useOauthUrlsQuery, useSignupMutation } from '../../generated/graphql'
import { WelcomeHeader } from '../utils/WelcomeHeader'
import { HubSpot } from '../utils/HubSpot'
import { fetchToken, setToken } from '../../helpers/authentication'
import { GqlError } from '../utils/Alert'

import { host } from '../../helpers/hostname'
import { useHistory } from '../../router'

import {
  PasswordError,
  PasswordErrorCode,
  PasswordErrorMessage,
  validatePassword,
} from './PasswordValidation'
import { getDeviceToken } from './utils'
import { finishedDeviceLogin } from './DeviceLoginNotif'
import { FlexAtBreak, OAuthOptions } from './MagicLogin'
import { LOGIN_BREAKPOINT, LoginPortal } from './LoginPortal'
import { LabelledInput } from './LabelledInput'

function PasswordErrorMsg({ errorCode }: { errorCode: PasswordErrorCode }) {
  return (
    <P
      caption
      color="text-error"
    >
      {PasswordErrorMessage[errorCode]}
    </P>
  )
}

export function SetPasswordField({
  errorCode,
  ...props
}: { errorCode?: PasswordErrorCode } & Omit<
  ComponentProps<typeof LabelledInput>,
  'errorCode'
>) {
  return (
    <LabelledInput
      label="Password"
      type="password"
      placeholder="Enter password"
      hint="10 character minimum"
      caption={
        errorCode === PasswordError.TooShort && (
          <PasswordErrorMsg errorCode={errorCode} />
        )
      }
      error={errorCode === PasswordError.TooShort}
      {...props}
    />
  )
}

export function ConfirmPasswordField({
  errorCode,
  ...props
}: ComponentProps<typeof SetPasswordField>) {
  return (
    <LabelledInput
      label="Confirm password"
      type="password"
      placeholder="Confirm password"
      hint=""
      caption={
        errorCode === PasswordError.NoMatch && (
          <PasswordErrorMsg errorCode={errorCode} />
        )
      }
      error={errorCode === PasswordError.NoMatch}
      {...props}
    />
  )
}

export function Signup() {
  const theme = useTheme()
  const history = useHistory()
  const location = useLocation()
  const [email, setEmail] = useState(location?.state?.email || '')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [account, setAccount] = useState('')
  const [confirm, setConfirm] = useState('')
  const deviceToken = getDeviceToken()
  const accountInputRef = useRef<HTMLElement>()
  const emailRef = useRef<HTMLElement>()
  const [mutation, { loading, error }] = useSignupMutation({
    variables: {
      attributes: { email, password, name },
      account: { name: account },
      deviceToken,
    },
    onCompleted: ({ signup }) => {
      if (deviceToken) {
        finishedDeviceLogin()
      }
      setToken(signup?.jwt)
      history.navigate('/shell')
    },
  })
  const { data } = useOauthUrlsQuery({ variables: { host: host() } })

  useEffect(() => {
    const ref = email ? accountInputRef : emailRef

    ref?.current?.querySelector('input')?.focus()
    // Only set focus on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (fetchToken()) {
      history.navigate('/')
    }
  }, [history])
  const onSubmit = useCallback(e => {
    e.preventDefault()
    mutation()
  }, [mutation])

  const accountError = error?.message.startsWith('name has already been taken')
    ? 'Name already taken'
    : undefined
  const emailError = error?.message.startsWith('email has already been taken')
    ? 'Email already taken'
    : undefined

  const { disabled, error: passwordError } = validatePassword(password, confirm)

  const showEmailError = error?.message?.startsWith('not_found')

  return (
    <LoginPortal>
      <HubSpot />
      <WelcomeHeader marginBottom="xxlarge" />
      <Form onSubmit={onSubmit}>
        {!showEmailError && !accountError && !emailError && error && (
          <Div marginBottom="medium">
            <GqlError
              error={error}
              header="Signup failed"
            />
          </Div>
        )}
        <LabelledInput
          ref={emailRef}
          label="Email address"
          value={email}
          onChange={setEmail}
          placeholder="Enter email address"
          hint={emailError}
          error={!!emailError}
        />
        <Flex
          flexWrap="wrap"
          width="100%"
          columnGap={theme.spacing.medium}
          flexBasis="100%"
        >
          <FlexAtBreak>
            <LabelledInput
              ref={accountInputRef}
              width="100%"
              label="Company name"
              value={account}
              onChange={setAccount}
              placeholder="Enter company name"
              hint={accountError}
              error={!!accountError}
            />
          </FlexAtBreak>
          <FlexAtBreak>
            <LabelledInput
              {...{
                [LOGIN_BREAKPOINT]: { flex: '1 0' },
              }}
              width="100%"
              label="Username"
              value={name}
              onChange={setName}
              placeholder="Enter username"
            />
          </FlexAtBreak>
        </Flex>
        <SetPasswordField
          value={password}
          onChange={setPassword}
          errorCode={passwordError}
        />
        <ConfirmPasswordField
          value={confirm}
          onChange={setConfirm}
          errorCode={passwordError}
        />
        <Button
          type="submit"
          primary
          width="100%"
          disabled={disabled}
          loading={loading}
        >
          Create account
        </Button>
      </Form>
      <OAuthOptions oauthUrls={data?.oauthUrls} />
      <P
        body2
        textAlign="center"
        marginTop="medium"
      >
        Already have an account?{' '}
        <A
          as={Link}
          inline
          to="/login"
        >
          Login
        </A>
      </P>
    </LoginPortal>
  )
}
