import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Box, Keyboard } from 'grommet'
import { GqlError } from 'forge-core'
import { AppIcon, Button } from 'pluralsh-design-system'

import { Text } from 'honorable'

import { setToken } from '../helpers/authentication'

import { UserFragment } from '../models/user'

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
      That invite code is no longer valid
    </Box>
  )
}

function ExistingInvite({ invite: { account }, id }) {
  const [mutation, { loading, error }] = useMutation(REALIZE, {
    variables: { id },
    onCompleted: ({ realizeInvite: { jwt } }) => {
      setToken(jwt)
      window.location = '/' as any as Location
    },
  })

  return (
    <LoginPortal>
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
          <Box align="center">You were invited to join another account</Box>
          <Button
            onClick={() => mutation()}
            loading={loading}
            width="100%"
            padding="medium"
          >
            Join {account.name}
          </Button>
        </Box>
      </Box>mo
    </LoginPortal>
  )
}

export default function Invite() {
  const { inviteId } = useParams()
  const [attributes, setAttributes] = useState({ name: '', password: '' })
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [mutation, { loading, error }] = useMutation(SIGNUP, {
    variables: { inviteId, attributes },
    onCompleted: ({ signup: { jwt } }) => {
      setToken(jwt)
      window.location = '/' as any as Location
    },
  })

  const { data, error: inviteError } = useQuery(INVITE_Q, { variables: { id: inviteId } })

  if (inviteError) return <InvalidInvite />
  if (!data) return null

  const isNameValid = attributes.name.length > 0
  const isPasswordValid = attributes.password.length > 10
  const passwordMatch = attributes.password === passwordConfirmation
  const isValid = isNameValid && isPasswordValid && passwordMatch

  if (data.invite.user) {
    return (
      <ExistingInvite
        invite={data.invite}
        id={inviteId}
      />
    )
  }

  return (
    <LoginPortal>
      <Box
        fill
        pad="medium"
      >
        <Keyboard onEnter={() => isValid && mutation()}>
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
              <AppIcon
                name={attributes.name || 'John Doe'}
                size="xsmall"
                hue="default"
              />
              <Box>
                <Text
                  body1
                  fontFamily="Monument Semi-Mono, monospace"
                  fontWeight="500"
                >
                  {attributes.name || 'John Doe'}
                </Text>
                <Text
                  caption
                  color="text-xlight"
                >
                  {data.invite.email}
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
                disabled
              />
              <LabelledInput
                label="Name"
                value={attributes.name}
                placeholder="John Doe"
                onChange={name => setAttributes({ ...attributes, name })}
                required
              />
              <LabelledInput
                type="password"
                label="Password"
                value={attributes.password}
                placeholder="Enter password"
                onChange={password => setAttributes({ ...attributes, password })}
                error={attributes.password.length > 0 && !isPasswordValid}
                hint={attributes.password.length > 0 && !isPasswordValid ? 'Password is too short. Use at least 10 characters.' : ''}
                required
              />
              <LabelledInput
                type="password"
                label="Confirm password"
                value={passwordConfirmation}
                placeholder="Enter password again"
                onChange={setPasswordConfirmation}
                error={passwordConfirmation && !passwordMatch}
                hint={passwordConfirmation && !passwordMatch ? 'Passwords do not match.' : ''}
                required
              />
            </Box>
            <Button
              primary
              width="100%"
              loading={loading}
              disabled={!isValid}
              onClick={() => mutation()}
            >
              Sign up
            </Button>
          </Box>
        </Keyboard>
      </Box>
    </LoginPortal>
  )
}
