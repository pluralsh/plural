import { ComponentProps, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '@pluralsh/design-system'

import { useTheme } from 'styled-components'

import { useOauthUrlsQuery, useSignupMutation } from '../../generated/graphql'
import { WelcomeHeader } from '../utils/WelcomeHeader'
import { HubSpot } from '../utils/HubSpot'
import { fetchToken, setAuthFromUser } from '../../helpers/authentication'
import { GqlError } from '../utils/Alert'
import { Body2P, CaptionP } from '../utils/Typography'

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
import { InlineLinkSC } from '../utils/Typography'
import { OAuthOptions } from './MagicLogin'
import { LoginPortal } from './LoginPortal'
import { LabelledInput } from './LabelledInput'

function PasswordErrorMsg({ errorCode }: { errorCode: PasswordErrorCode }) {
  return (
    <CaptionP $color="text-danger">{PasswordErrorMessage[errorCode]}</CaptionP>
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
  const accountInputRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLDivElement>(null)
  const [mutation, { loading, error }] = useSignupMutation({
    variables: {
      attributes: { email, password, name },
      account: { name: account },
      deviceToken,
    },
    onCompleted: ({ signup }) => {
      if (!signup?.jwt) return
      if (deviceToken) {
        finishedDeviceLogin()
      }
      setAuthFromUser(signup)
      history.navigate('/')
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
  const onSubmit = useCallback(
    (e) => {
      e.preventDefault()
      mutation()
    },
    [mutation]
  )

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
      <div css={{ marginBottom: theme.spacing.xxlarge }}>
        <WelcomeHeader />
      </div>
      <form onSubmit={onSubmit}>
        {!showEmailError && !accountError && !emailError && error && (
          <div css={{ marginBottom: theme.spacing.medium }}>
            <GqlError
              error={error}
              header="Signup failed"
            />
          </div>
        )}
        <LabelledInput
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Enter full name"
          inputProps={{ autoComplete: 'name' }}
        />
        <LabelledInput
          ref={emailRef}
          label="Email address"
          value={email}
          onChange={setEmail}
          placeholder="Enter email address"
          hint={emailError}
          error={!!emailError}
          inputProps={{ type: 'email', autoComplete: 'email' }}
        />
        <LabelledInput
          ref={accountInputRef}
          label="Company name"
          value={account}
          onChange={setAccount}
          placeholder="Enter company name"
          hint={accountError}
          error={!!accountError}
          inputProps={{ autoComplete: 'organization' }}
        />
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
          data-phid="create-account-cta"
          type="submit"
          primary
          width="100%"
          disabled={disabled}
          loading={loading}
        >
          Create account
        </Button>
      </form>
      <OAuthOptions oauthUrls={data?.oauthUrls} />
      <Body2P
        css={{
          textAlign: 'center',
          marginTop: theme.spacing.medium,
        }}
      >
        Already have an account? <InlineLinkSC to="/login">Log in</InlineLinkSC>
      </Body2P>
    </LoginPortal>
  )
}
