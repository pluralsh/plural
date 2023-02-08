import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { GqlError } from 'forge-core'
import { Button } from '@pluralsh/design-system'

import {
  Div,
  Flex,
  Form,
  P,
} from 'honorable'

import { setToken } from '../helpers/authentication'

import {
  Invite as InviteT,
  User,
  useInviteQuery,
  useRealizeInviteMutation,
  useSignupInviteMutation,
} from '../generated/graphql'

import { LoginPortal } from './users/LoginPortal'
import { LabelledInput } from './users/LabelledInput'
import { WelcomeHeader } from './utils/WelcomeHeader'
import { ConfirmPasswordField, SetPasswordField } from './users/Signup'
import { validatePassword } from './users/PasswordValidation'

function InvalidInvite() {
  return (
    <Flex
      width="100vw"
      height="100vh"
      justifyContent="center"
      alignItems="center"
    >
      This invite code is no longer valid
    </Flex>
  )
}

function ExistingInvite({
  invite: { account },
  id,
  user,
}: {
  invite: InviteT
  id: any
  user: User
}) {
  const [mutation, { loading, error }] = useRealizeInviteMutation({
    variables: { id },
    onCompleted: ({ realizeInvite }) => {
      setToken(realizeInvite?.jwt)
      ;(window as Window).location = '/'
    },
  })

  return (
    <LoginPortal>
      <Flex
        flexDirection="column"
        gap="medium"
      >
        {error && (
          <GqlError
            error={error}
            header="Something went wrong!"
          />
        )}
        <P
          body1
          color="text-xlight"
        >
          {account?.name} invited you to join their Plural account. Joining will
          remove {user?.email} from the {user?.account?.name} account.
        </P>
        <Button
          onClick={() => mutation()}
          loading={loading}
          width="100%"
          padding="medium"
        >
          Leave {user?.account?.name} and join {account?.name}
        </Button>
      </Flex>
    </LoginPortal>
  )
}

export default function Invite() {
  const { inviteId } = useParams()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [mutation, { loading, error }] = useSignupInviteMutation({
    variables: {
      inviteId: inviteId ?? '',
      attributes: {
        name,
        password,
      },
    },
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

  const { disabled: passwordDisabled, error: passwordError } = validatePassword(password,
    confirm)

  const isNameValid = name.length > 0
  const submitEnabled = isNameValid && !passwordDisabled

  if (data?.invite?.user) {
    return (
      <ExistingInvite
        invite={data.invite}
        id={inviteId}
        user={data.invite.user}
      />
    )
  }

  const onSubmit = e => {
    e.preventDefault()
    if (!submitEnabled) {
      return
    }
    mutation()
  }

  return (
    <LoginPortal>
      <Div marginBottom="xlarge">
        <WelcomeHeader
          textAlign="left"
          marginBottom="xxsmall"
        />{' '}
        <P
          body1
          color="text-xlight"
        >
          {data.invite?.account?.name} invited you to join their Plural account.
          Create an account to join.
        </P>
      </Div>
      <Form onSubmit={onSubmit}>
        {error && (
          <Div marginBottom="large">
            <GqlError
              header="Signup failed"
              error={error}
            />
          </Div>
        )}
        <Flex
          flexDirection="column"
          gap="small"
          marginBottom="small"
        >
          <LabelledInput
            label="Email"
            value={data?.invite?.email}
            disabled
          />
          <LabelledInput
            label="Username"
            value={name}
            placeholder="Enter username"
            onChange={setName}
            required
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
        </Flex>
        <Button
          type="submit"
          primary
          width="100%"
          loading={loading}
          disabled={!submitEnabled}
        >
          Sign up
        </Button>
      </Form>
    </LoginPortal>
  )
}
