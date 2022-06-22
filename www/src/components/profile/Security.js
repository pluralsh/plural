import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { Button, Div, Flex, Span } from 'honorable'
import { StatusOkIcon, ValidatedInput } from 'pluralsh-design-system'
import { createElement, useContext, useState } from 'react'
import { Password } from 'forge-core'

import { host } from '../../helpers/hostname'

import { CurrentUserContext } from '../login/CurrentUser'
import { METHOD_ICONS } from '../users/OauthEnabler'
import { OAUTH_URLS, UPDATE_USER } from '../users/queries'

import { Header } from './Header'
import { LoginMethod as Method } from './types'

function Section({ header, description, children, noHeader }) {
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

const validPassword = pass => pass.length < 8 ? { error: true, message: 'password is too short' } : { error: false, message: 'valid password!' }

function UpdatePassword({ cancel }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [mutation, { loading }] = useMutation(UPDATE_USER, { variables: { attributes: { password } } })
    
  return (
    <Box gap="small">
      <ValidatedInput
        width="80%"
        label="Password"
        type="password"
        value={password}
        onChange={({ target: { value } }) => setPassword(value)}
        validation={pass => !pass ? null : validPassword(pass)}
      />
      <ValidatedInput
        width="80%"
        label="Confirm Password"
        type="password"
        value={confirm}
        onChange={({ target: { value } }) => setConfirm(value)}
        validation={pass => !pass ? null : (pass !== password ? { error: true, message: 'passwords do not match' } : { error: false, message: 'passwords match!' })}
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

function LoginMethod({ icon, name, onClick, active }) {
  return (
    <Box
      border
      width="70%"
      round="xsmall"
      onClick={active ? null : onClick}
      hoverIndicator="background-middle"
      background={active ? 'background-middle' : null}
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
          icon={createElement(METHOD_ICONS[provider], { size: '20px', color: 'plain' })}
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
    <Flex
      width="75%"
      align="center"
      direction="column"
    >
      <Box
        gap="medium"
        fill
      >
        <Header
          header="Security & Privacy"
          description="Manage how you log in to your account"
        />
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
    </Flex>
  )
}
