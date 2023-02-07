import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Keyboard } from 'grommet'
import { GqlError } from 'forge-core'
import { AppIcon, Button } from '@pluralsh/design-system'

import { Text } from 'honorable'

import { setToken } from '../helpers/authentication'

import { useInviteQuery, useRealizeInviteMutation, useSignupInviteMutation } from '../generated/graphql'

import { LoginPortal } from './users/LoginPortal'
import { LabelledInput } from './users/LabelledInput'
import { WelcomeHeader } from './utils/WelcomeHeader'

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

function ExistingInvite({ invite: { account }, id }: any) {
  const [mutation, { loading, error }] = useRealizeInviteMutation({
    variables: { id },
    onCompleted: ({ realizeInvite }) => {
      setToken(realizeInvite?.jwt)
      ;(window as Window).location = '/'
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
      </Box>
    </LoginPortal>
  )
}

export default function Invite() {
  const { inviteId } = useParams()
  const [attributes, setAttributes] = useState({ name: '', password: '' })
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [mutation, { loading, error }] = useSignupInviteMutation({
    variables: { inviteId: inviteId ?? '', attributes },
    onCompleted: ({ signup }) => {
      setToken(signup?.jwt)
      ;(window as Window).location = '/'
    },
  })

  const { data, error: inviteError } = useInviteQuery({
    variables: { id: inviteId ?? '' },
  })

  if (inviteError) return <InvalidInvite />
  if (!data) return null

  const isNameValid = attributes.name.length > 0
  const isPasswordValid = attributes.password.length >= 10
  const passwordMatch = attributes.password === passwordConfirmation
  const isValid = isNameValid && isPasswordValid && passwordMatch

  if (data?.invite?.user) {
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
            <WelcomeHeader />
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
                  {data?.invite?.email}
                </Text>
              </Box>
            </Box>
            <Box
              gap="small"
              fill="horizontal"
            >
              <LabelledInput
                label="Email"
                value={data?.invite?.email}
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
                hint={
                  attributes.password.length > 0 && !isPasswordValid
                    ? 'Password is too short. Use at least 10 characters.'
                    : ''
                }
                required
              />
              <LabelledInput
                type="password"
                label="Confirm password"
                value={passwordConfirmation}
                placeholder="Enter password again"
                onChange={setPasswordConfirmation}
                error={passwordConfirmation && !passwordMatch}
                hint={
                  passwordConfirmation && !passwordMatch
                    ? 'Passwords do not match.'
                    : ''
                }
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
