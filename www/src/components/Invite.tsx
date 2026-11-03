import { Button, Flex } from '@pluralsh/design-system'

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTheme } from 'styled-components'

import {
  useInviteQuery,
  useRealizeInviteMutation,
  useSignupInviteMutation,
  InviteFragment,
} from '../generated/graphql'
import { setAuthFromUser } from '../helpers/authentication'

import { LabelledInput } from './users/LabelledInput'
import { LoginPortal } from './users/LoginPortal'
import { validatePassword } from './users/PasswordValidation'
import { ConfirmPasswordField, SetPasswordField } from './users/Signup'
import { WelcomeHeader } from './utils/WelcomeHeader'
import LoadingIndicator from './utils/LoadingIndicator'
import isEmpty from 'lodash/isEmpty'
import { GqlError } from './utils/Alert'
import { Body1P } from './utils/Typography'

function ExistingInvite({
  inviteId,
  invite: { account, user },
}: {
  inviteId: string
  invite: InviteFragment
}) {
  const [mutation, { loading, error }] = useRealizeInviteMutation({
    variables: { id: inviteId },
    onCompleted: ({ realizeInvite }) => {
      setAuthFromUser(realizeInvite)
      ;(window as Window).location = '/'
    },
  })

  return (
    <LoginPortal>
      <Flex
        direction="column"
        gap="medium"
      >
        {error && (
          <GqlError
            error={error}
            header="Something went wrong!"
          />
        )}
        <Body1P $color="text-xlight">
          {account?.name} invited you to join their Plural account. Joining will
          remove {user?.email} from the {user?.account?.name} account.
        </Body1P>
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
  const theme = useTheme()
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
      setAuthFromUser(signup)
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
        align="center"
        justify="center"
      >
        <GqlError
          error={error}
          header="Could not load invite"
        />
      </Flex>
    )

  if (!invite || !inviteId)
    return (
      <Flex
        grow={1}
        align="center"
        justify="center"
      >
        This invite code does not exist or is no longer valid
      </Flex>
    )

  const { disabled: passwordDisabled, error: passwordError } = validatePassword(
    password,
    confirm
  )

  if (invite.user)
    return (
      <ExistingInvite
        inviteId={inviteId}
        invite={invite}
      />
    )

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
      <div css={{ marginBottom: theme.spacing.xlarge }}>
        <div css={{ marginBottom: theme.spacing.xxsmall }}>
          <WelcomeHeader textAlign="left" />
        </div>
        <Body1P $color="text-xlight">
          {invite.account?.name} invited you to join their Plural account.
          Create an account to join.
        </Body1P>
      </div>
      <form onSubmit={onSubmit}>
        {error && (
          <div css={{ marginBottom: theme.spacing.large }}>
            <GqlError
              header="Signup failed"
              error={error}
            />
          </div>
        )}
        <Flex
          direction="column"
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
      </form>
    </LoginPortal>
  )
}
