import { useCallback, useEffect, useRef, useState } from 'react'
import { Form } from 'grommet'
import { Link, useLocation } from 'react-router-dom'
import { A, Button, Div, P } from 'honorable'
import useScript from 'react-script-hook'

import { useOauthUrlsQuery, useSignupMutation } from '../../generated/graphql'
import { WelcomeHeader } from '../utils/WelcomeHeader'
import { fetchToken, setToken } from '../../helpers/authentication'
import { GqlError } from '../utils/Alert'
import { disableState } from '../Login'
import { host } from '../../helpers/hostname'
import { useHistory } from '../../router'

import { getDeviceToken } from './utils'
import { finishedDeviceLogin } from './DeviceLoginNotif'
import { LabelledInput, LoginPortal, OAuthOptions } from './MagicLogin'

export function Signup() {
  const history = useHistory()
  const location = useLocation()
  const [email, setEmail] = useState(location?.state?.email || '')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [account, setAccount] = useState('')
  const [confirm, setConfirm] = useState('')
  const deviceToken = getDeviceToken()
  const nameRef = useRef<HTMLElement>()
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
    const ref = email ? nameRef : emailRef

    ref?.current?.querySelector('input')?.focus()
    // Only set focus on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (fetchToken()) {
      history.navigate('/')
    }
  }, [history])
  useScript({ src: 'https://js.hs-scripts.com/22363579.js' })
  const submit = useCallback(() => {
    mutation()
  }, [mutation])

  // @ts-expect-error
  const { disabled, reason } = disableState(password, confirm, email)

  return (
    <LoginPortal>
      <WelcomeHeader marginBottom="xxlarge" />
      <Form onSubmit={submit}>
        {error && (
          <Div marginBottom="medium">
            <GqlError error={error} header="Signup failed" />
          </Div>
        )}
        <LabelledInput
          ref={emailRef}
          label="Email address"
          value={email}
          onChange={setEmail}
          placeholder="Enter email address"
        />
        <LabelledInput
          ref={nameRef}
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
          hint={
            reason === 'Password is too short' && (
              <P caption color="text-error">
                Password is too short
              </P>
            )
          }
        />
        <LabelledInput
          label="Confirm password"
          value={confirm}
          type="password"
          onChange={setConfirm}
          placeholder="Enter password again"
          hint={
            reason === 'Passwords do not match' && (
              <P caption color="text-error">
                Password doesn't match
              </P>
            )
          }
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
      <P body2 textAlign="center" marginTop="medium">
        Already have an account?{' '}
        <A as={Link} inline to="/login">
          Login
        </A>
      </P>
    </LoginPortal>
  )
}
