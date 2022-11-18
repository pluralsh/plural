import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { Button, Div, Span } from 'honorable'
import {
  ContentCard,
  PageTitle,
  StatusOkIcon,
  ValidatedInput,
} from '@pluralsh/design-system'
import { createElement, useContext, useState } from 'react'
// import { Password } from 'forge-core'

import { METHOD_ICONS } from '../users/utils'

import { host } from '../../helpers/hostname'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import { OAUTH_URLS, UPDATE_USER } from '../users/queries'

import { LoginMethod as Method } from './types'

function Section({ header, description, children }: any) {
  return (
    <Div>
      <Div marginBottom="small">
        <Div
          body1
          fontWeight="600"
        >
          {header}
        </Div>
        {description && <Div color="text-light">{description}</Div>}
      </Div>
      {children}
    </Div>
  )
}

const validPassword = pass => (pass.length < 8 ? { error: true, message: 'password is too short' } : { error: false, message: 'valid password!' })

function UpdatePassword({ cancel }: any) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [second, setSecond] = useState('')
  const [mutation, { loading }] = useMutation(UPDATE_USER, { variables: { attributes: { password, confirm } } })

  return (
    <Box gap="small">
      <ValidatedInput
        width="100%"
        label="Current password"
        placeholder="Enter your current password"
        type="password"
        value={confirm}
        onChange={({ target: { value } }) => setConfirm(value)}
      />
      <ValidatedInput
        width="100%"
        label="New password"
        placeholder="Enter new password"
        type="password"
        value={password}
        onChange={({ target: { value } }) => setPassword(value)}
        validation={pass => (!pass ? null : validPassword(pass))}
      />
      <ValidatedInput
        width="100%"
        label="Confirm new password"
        placeholder="Enter new password again"
        type="password"
        value={second}
        onChange={({ target: { value } }) => setSecond(value)}
        validation={pass => (!pass ? null : (pass !== password ? { error: true, message: 'passwords do not match' } : { error: false, message: 'passwords match!' }))}
      />
      <Box
        direction="row"
        align="center"
        justify="end"
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
          disabled={password.length < 8 || password !== second}
          onClick={() => mutation()}
        >
          Update password
        </Button>
      </Box>
    </Box>
  )
}

function LoginMethod({
  icon, name, onClick, active,
}: any) {
  return (
    <Box
      border
      width="100%"
      height={{ min: '44px' }}
      round="xsmall"
      onClick={active ? null : onClick}
      hoverIndicator="fill-one-hover"
      background={active ? 'fill-one-hover' : undefined}
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
  const { me } = useContext(CurrentUserContext)
  const { data } = useQuery(OAUTH_URLS, { variables: { host: host() } })
  const [mutation] = useMutation(UPDATE_USER)

  if (!data) return null

  return (
    <Box
      gap="small"
      margin={{ bottom: '24px' }}
    >
      {data.oauthUrls.map(({ provider, authorizeUrl }, i) => (
        <LoginMethod
          key={i}
          icon={createElement(METHOD_ICONS[provider], { size: '20px', color: 'white' })}
          active={me.loginMethod === provider}
          name={`Login with ${provider.toLowerCase()}`}
          onClick={() => window.location = authorizeUrl}
        />
      ))}
      <LoginMethod
        icon={<Password size="20px" />}
        active={me.loginMethod === Method.PASSWORD}
        name="Login with password"
        onClick={() => mutation({ variables: { attributes: { loginMethod: Method.PASSWORD } } })}
      />
    </Box>
  )
}

export function Security() {
  const [pass, setPass] = useState(false)

  return (
    <Box fill>
      <PageTitle heading="Security" />
      <ContentCard overflowY="auto">
        <Box
          gap="medium"
          fill
        >
          <Section header="Password">
            {!pass && (
              <Button
                alignSelf="start"
                secondary
                onClick={() => setPass(true)}
              >
                Change password
              </Button>
            )}
            {pass && <UpdatePassword cancel={() => setPass(false)} />}
          </Section>
          <Section
            header="Login methods"
            description="Choose one method to login with."
          >
            <LoginMethods />
          </Section>
        </Box>
      </ContentCard>
    </Box>
  )
}
