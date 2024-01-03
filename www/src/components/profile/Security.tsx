import { useMutation, useQuery } from '@apollo/client'
import { Div, Span } from 'honorable'
import {
  Button,
  ContentCard,
  PageTitle,
  StatusOkIcon,
  ValidatedInput,
} from '@pluralsh/design-system'
import { createElement, useContext, useState } from 'react'
import { Password } from 'forge-core'

import styled, { useTheme } from 'styled-components'

import { METHOD_ICONS } from '../users/utils'
import { host } from '../../helpers/hostname'
import CurrentUserContext from '../../contexts/CurrentUserContext'
import { OAUTH_URLS, UPDATE_USER } from '../users/queries'

import { LoginMethod as Method } from './types'

function Section({ header, description, children }: any) {
  const theme = useTheme()

  return (
    <div>
      <div css={{ marginBottom: theme.spacing.small }}>
        <div
          css={{
            ...theme.partials.text.body1Bold,
          }}
        >
          {header}
        </div>
        {description && (
          <div css={{ color: theme.colors['text-light'] }}>{description}</div>
        )}
      </div>
      {children}
    </div>
  )
}

const validPassword = (pass) =>
  pass.length < 8
    ? { error: true, message: 'password is too short' }
    : { error: false, message: 'valid password!' }

function UpdatePassword({ cancel }: any) {
  const theme = useTheme()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [second, setSecond] = useState('')
  const [mutation, { loading }] = useMutation(UPDATE_USER, {
    variables: { attributes: { password, confirm } },
  })

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.small,
      }}
    >
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
        validation={(pass) => (!pass ? null : validPassword(pass))}
      />
      <ValidatedInput
        width="100%"
        label="Confirm new password"
        placeholder="Enter new password again"
        type="password"
        value={second}
        onChange={({ target: { value } }) => setSecond(value)}
        validation={(pass) =>
          !pass
            ? null
            : pass !== password
            ? { error: true, message: 'passwords do not match' }
            : { error: false, message: 'passwords match!' }
        }
      />
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: theme.spacing.small,
        }}
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
      </div>
    </div>
  )
}

const LoginMethodSC = styled.button<{ $active }>(
  ({ theme, $active: active }) => ({
    ...theme.partials.reset.button,
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing.small,
    border: theme.borders.default,
    width: '100%',
    minHeight: 44,
    borderRadius: theme.borderRadiuses.large,
    hoverIndicator: 'fill-one-hover',
    background: active
      ? theme.colors['fill-one-selected']
      : theme.colors['fill-one'],
    '&:hover': {
      background: theme.colors['fill-one-hover'],
    },
    alignItems: 'center',
    padding: `${theme.spacing.small}px ${theme.spacing.medium}px`,
  })
)

function LoginMethod({ icon, name, onClick, active }: any) {
  return (
    <LoginMethodSC
      $active={active}
      onClick={active ? null : onClick}
    >
      {icon}
      <div css={{ flexGrow: 1 }}>
        <Span>{name}</Span>
      </div>
      {active && (
        <StatusOkIcon
          size={20}
          color="icon-success"
        />
      )}
    </LoginMethodSC>
  )
}

function LoginMethods() {
  const theme = useTheme()
  const me = useContext(CurrentUserContext)
  const { data } = useQuery(OAUTH_URLS, { variables: { host: host() } })
  const [mutation] = useMutation(UPDATE_USER)

  if (!data) return null

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.small,
        marginBottom: theme.spacing.large,
      }}
    >
      {data.oauthUrls.map(({ provider, authorizeUrl }, i) => (
        <LoginMethod
          key={i}
          icon={createElement(METHOD_ICONS[provider], {
            size: '20px',
            color: theme.colors['icon-default'],
          })}
          active={me.loginMethod === provider}
          name={`Login with ${provider.toLowerCase()}`}
          onClick={() => (window.location = authorizeUrl)}
        />
      ))}
      <LoginMethod
        icon={
          <Password
            size="20px"
            color={theme.colors['icon-default']}
          />
        }
        active={me.loginMethod === Method.PASSWORD}
        name="Login with password"
        onClick={() =>
          mutation({
            variables: { attributes: { loginMethod: Method.PASSWORD } },
          })
        }
      />
    </div>
  )
}

export function Security() {
  const theme = useTheme()
  const [pass, setPass] = useState(false)

  return (
    <div css={{ paddingBottom: theme.spacing.large }}>
      <PageTitle heading="Security" />
      <ContentCard overflowY={undefined}>
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.medium,
          }}
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
        </div>
      </ContentCard>
    </div>
  )
}
