import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { Button, Div, Span } from 'honorable'
import { PageTitle, StatusOkIcon, ValidatedInput } from 'pluralsh-design-system'
import { createElement, useContext, useState } from 'react'
import { Password } from 'forge-core'

import { host } from '../../helpers/hostname'

import { CurrentUserContext } from '../login/CurrentUser'
import { METHOD_ICONS } from '../users/OauthEnabler'
import { OAUTH_URLS, UPDATE_USER } from '../users/queries'

import { Container } from '../utils/Container'

import { LoginMethod as Method } from './types'

function Section({
  header, description, children, noHeader,
}) {
  return (
    <Box gap="small">
      <Box gap="2px">
        {!noHeader && <Span fontWeight="bold">{header}</Span>}
        {description && <Span color="text-light">{description}</Span>}
      </Box>
      {children}
    </Box>
  )
}

const validPassword = pass => (pass.length < 8 ? { error: true, message: 'password is too short' } : { error: false, message: 'valid password!' })

function UpdatePassword({ cancel }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [mutation, { loading }] = useMutation(UPDATE_USER, { variables: { attributes: { password } } })

  return (
    <Box gap="small">
      <ValidatedInput
        width="100%"
        label="Password"
        placeholder="enter a new password"
        type="password"
        value={password}
        onChange={({ target: { value } }) => setPassword(value)}
        validation={pass => (!pass ? null : validPassword(pass))}
      />
      <ValidatedInput
        width="100%"
        label="Confirm Password"
        placeholder="reenter your password to confirm"
        type="password"
        value={confirm}
        onChange={({ target: { value } }) => setConfirm(value)}
        validation={pass => (!pass ? null : (pass !== password ? { error: true, message: 'passwords do not match' } : { error: false, message: 'passwords match!' }))}
      />
      <Box
        direction="row"
        align="center"
        gap="small"
      >
        <Button
          secondary
          small
          onClick={cancel}
        >
          Cancel
        </Button>
        <Button
          small
          loading={loading}
          disabled={password.length < 8 || password !== confirm}
          onClick={mutation}
        >
          Update Password
        </Button>
      </Box>
    </Box>
  )
}

function LoginMethod({
  icon, name, onClick, active,
}) {
  return (
    <Box
      border
      width="100%"
      round="xsmall"
      onClick={active ? null : onClick}
      hoverIndicator="fill-one-hover"
      background={active ? 'fill-one-hover' : null}
      direction="row"
      align="center"
      gap="small"
      pad={{ horizontal: 'medium', vertical: 'small' }}
    >
      {icon}
      <Box fill="horizontal">
        <Span>{name}</Span>
      </Box>
      {active && (
        <StatusOkIcon
          size={20}
          color="icon-success"
        />
      )}
    </Box>
  )
}

function LoginMethods() {
  const me = useContext(CurrentUserContext)
  const { data } = useQuery(OAUTH_URLS, { variables: { host: host() } })
  const [mutation] = useMutation(UPDATE_USER)

  if (!data) return null

  return (
    <Box gap="small">
      {data.oauthUrls.map(({ provider, authorizeUrl }) => (
        <LoginMethod
          icon={createElement(METHOD_ICONS[provider], { size: '20px', color: provider === Method.GITHUB ? 'white' : 'plain' })}
          active={me.loginMethod === provider}
          name={`Login with ${provider.toLowerCase()}`}
          onClick={() => {
            window.location = authorizeUrl
          }}
        />
      ))}
      <LoginMethod
        icon={<Password size="20px" />}
        active={me.loginMethod === Method.PASSWORD}
        name="Login with password"
        onClick={() => mutation({ variables: { attributes: { loginMethod: Method.PASSWORD } } })}
      />
      <LoginMethod
        icon={<Password size="20px" />}
        active={me.loginMethod === Method.PASSWORDLESS}
        name="Passwordless login"
        onClick={() => mutation({ variables: { attributes: { loginMethod: Method.PASSWORDLESS } } })}
      />
    </Box>
  )
}

export function Security() {
  const [pass, setPass] = useState(false)

  return (
    <Container type="form">
      <Box
        gap="medium"
        fill
      >
        <PageTitle heading="Security" />
        <Section
          header="Password"
          noHeader={pass}
        >
          {!pass && (
            <Div>
              <Button
                secondary
                onClick={() => setPass(true)}
              >
                Change Password
              </Button>
            </Div>
          )}
          {pass && <UpdatePassword cancel={() => setPass(false)} />}
        </Section>
        <Section
          header="Login methods"
          description="Change the method you use to log in"
        >
          <LoginMethods />
        </Section>
      </Box>
    </Container>
  )
}
