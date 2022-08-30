import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Box, Keyboard, Text } from 'grommet'
import { GqlError } from 'forge-core'
import { Checkmark, StatusCritical } from 'grommet-icons'
import { Button } from 'pluralsh-design-system'

import { setToken } from '../helpers/authentication'

import { UserFragment } from '../models/user'

import { initials } from './users/Avatar'
import { LabelledInput, LoginPortal } from './users/MagicLogin'
import { WelcomeHeader } from './utils/WelcomeHeader'

const SIGNUP = gql`
  mutation Signup($attributes: UserAttributes!, $inviteId: String!) {
    signup(attributes: $attributes, inviteId: $inviteId) {
      jwt
    }
  }
`

const REALIZE = gql`
  mutation Realize($id: String!) {
    realizeInvite(id: $id) {
      jwt
    }
  }
`

const INVITE_Q = gql`
  query Invite($id: String!) {
    invite(id: $id) {
      email
      account { name }
      user { ...UserFragment }
    }
  }
  ${UserFragment}
`

function InvalidInvite() {
  return (
    <Box
      width="100vw"
      height="100vh"
      justify="center"
      align="center"
    >
      <Box>
        <Text>That invite code is no longer valid</Text>
      </Box>
    </Box>
  )
}

export function disableState(password, confirm) {
  if (password.length < 10) return { disabled: true, reason: 'password is too short' }
  if (password !== confirm) return { disabled: true, reason: 'passwords do not match' }

  return { disabled: false, reason: 'passwords match!' }
}

function DummyAvatar({ name, size: given }) {
  const size = given || '50px'

  return (
    <Box
      flex={false}
      round="xsmall"
      align="center"
      justify="center"
      width={size}
      height={size}
      background="#6b5b95"
    >
      <Text size="small">{initials(name)}</Text>
    </Box>
  )
}

export function PasswordStatus({ disabled, reason }) {
  return (
    <Box
      direction="row"
      fill="horizontal"
      align="center"
      gap="xsmall"
    >
      {disabled ? (
        <StatusCritical
          color="error"
          size="12px"
        />
      ) : (
        <Checkmark
          color="status-ok"
          size="12px"
        />
      )}
      <Text
        size="small"
        color={disabled ? 'error' : 'status-ok'}
      >{reason}
      </Text>
    </Box>
  )
}

function ExistingInvite({ invite: { account }, id }) {
  const [mutation, { loading, error }] = useMutation(REALIZE, {
    variables: { id },
    onCompleted: ({ realizeInvite: { jwt } }) => {
      setToken(jwt)
      window.location = '/'
    },
  })

  return (
    <LoginPortal style={{ minWidth: '50%' }}>
      <Box
        fill
        pad="medium"
      >
        <Box
          flex={false}
          gap="medium"
        >
          {error && (
            <GqlError
              error={error}
              header="Something went wrong!"
            />
          )}
          <Box
            justify="center"
            align="center"
          >
            <Text>You were invited to join another account</Text>
          </Box>
          <Box
            direction="row"
            fill="horizontal"
          >
            <Button
              onClick={mutation}
              loading={loading}
              fill="horizontal"
              size="small"
              round="xsmall"
              pad={{ vertical: 'xsmall', horizontal: 'medium' }}
              label={`Join ${account.name}`}
            />
          </Box>
        </Box>
      </Box>
    </LoginPortal>
  )
}

export default function Invite() {
  const { inviteId } = useParams()
  const [attributes, setAttributes] = useState({ name: '', password: '' })
  const [confirm, setConfirm] = useState('')
  const [mutation, { loading, error }] = useMutation(SIGNUP, {
    variables: { inviteId, attributes },
    onCompleted: ({ signup: { jwt } }) => {
      setToken(jwt)
      window.location = '/'
    },
  })

  const { data, error: inviteError } = useQuery(INVITE_Q, { variables: { id: inviteId } })

  if (inviteError) return <InvalidInvite />
  if (!data) return null

  const { disabled, reason } = disableState(attributes.password, confirm)
  const valid = attributes.name.length > 0 && attributes.password.length > 0 && attributes.password === confirm

  if (data.invite.user) {
    return (
      <ExistingInvite
        invite={data.invite}
        id={inviteId}
      />
    )
  }

  return (
    <LoginPortal style={{ minWidth: '50%' }}>
      <Box
        fill
        pad="medium"
      >
        <Keyboard onEnter={valid && mutation}>
          <Box
            flex={false}
            gap="small"
          >
            {error && (
              <GqlError
                error={error}
                header="Something went wrong!"
              />
            )}
            <WelcomeHeader heading="Accept your invitation" />
            <Box
              direction="row"
              gap="small"
              align="center"
              margin={{ vertical: '32px' }}
            >
              <DummyAvatar name={attributes.name} />
              <Box>
                <Text
                  size="small"
                  weight={500}
                >{attributes.name}
                </Text>
                <Text
                  size="small"
                  color="dark-3"
                >{data.invite.email}
                </Text>
              </Box>
            </Box>
            <Box
              gap="small"
              fill="horizontal"
            >
              <LabelledInput
                label="Email"
                value={data.invite.email}
              />
              <LabelledInput
                label="Name"
                value={attributes.name}
                placeholder="John Doe"
                onChange={name => setAttributes({ ...attributes, name })}
              />
              <LabelledInput
                type="password"
                label="Password"
                value={attributes.password}
                placeholder="Enter password"
                onChange={password => setAttributes({ ...attributes, password })}
              />
              <LabelledInput
                type="password"
                label="Confirm password"
                value={confirm}
                placeholder="Enter password again"
                onChange={setConfirm}
              />
            </Box>
            <Box
              align="center"
              gap="small"
            >
              <PasswordStatus
                disabled={disabled}
                reason={reason}
              />
              <Box
                fill="horizontal"
                direction="row"
                gap="small"
              >
                <Button
                  primary
                  width="100%"
                  loading={loading}
                  disabled={!valid}
                  onClick={mutation}
                >
                  Sign up
                </Button>
              </Box>
            </Box>
          </Box>
        </Keyboard>
      </Box>
    </LoginPortal>
  )
}
