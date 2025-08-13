import { Button } from '@pluralsh/design-system'

import { Div, Flex, Form, P } from 'honorable'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  useInviteQuery,
  useRealizeInviteMutation,
  useSignupInviteMutation,
  InviteFragment,
} from '../generated/graphql'
import { setToken } from '../helpers/authentication'

import { LabelledInput } from './users/LabelledInput'
import { LoginPortal } from './users/LoginPortal'
import { validatePassword } from './users/PasswordValidation'
import { ConfirmPasswordField, SetPasswordField } from './users/Signup'
import { WelcomeHeader } from './utils/WelcomeHeader'
import LoadingIndicator from './utils/LoadingIndicator'
import isEmpty from 'lodash/isEmpty'
import { GqlError } from './utils/Alert'

function ExistingInvite({
  invite: { id, account, user },
}: {
  invite: InviteFragment
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
      attributes: { name, password },
    },
    onCompleted: ({ signup }) => {
      setToken(signup?.jwt)
      ;(window as Window).location = '/'
    },
  })

  const {
    data,
    loading: inviteLoading,
    error: inviteError,
  } = useInviteQuery({
    variables: { id: inviteId ?? '' },
  })

  const invite = data?.invite

  if (!data && inviteLoading) return <LoadingIndicator />

  if (inviteError)
    return (
      <Flex
        grow={1}
        alignItems="center"
        justifyContent="center"
      >
        <GqlError
          error={error}
          header="Could not load invite"
        />
      </Flex>
    )

  if (!invite)
    return (
      <Flex
        grow={1}
        alignItems="center"
        justifyContent="center"
      >
        This invite code does not exist or is no longer valid
      </Flex>
    )

  const { disabled: passwordDisabled, error: passwordError } = validatePassword(
    password,
    confirm
  )

  if (invite.user) return <ExistingInvite invite={invite} />

  const submitEnabled = !isEmpty(name) && !passwordDisabled
  const onSubmit = (e) => {
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
        />
        <P
          body1
          color="text-xlight"
        >
          {invite.account?.name} invited you to join their Plural account.
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
            value={invite.email}
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
