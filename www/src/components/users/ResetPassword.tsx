import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Flex } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

import {
  useRealizeResetTokenMutation,
  useResetTokenQuery,
} from '../../generated/graphql'

import { wipeRefreshToken, wipeToken } from '../../helpers/authentication'

import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { Title1H1 } from '../utils/Typography'

import { validatePassword } from './PasswordValidation'

import { LoginPortal } from './LoginPortal'
import { LabelledInput } from './LabelledInput'
import { ConfirmPasswordField, SetPasswordField } from './Signup'

export function ResetPassword() {
  const theme = useTheme()
  const { id } = useParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const { data } = useResetTokenQuery({ variables: { id: id ?? '' } })
  const [mutation, { loading, data: realized, error }] =
    useRealizeResetTokenMutation({
      variables: { id: id ?? '', attributes: { password } },
      onCompleted: () => {
        wipeToken()
        wipeRefreshToken()
        window.location = '/login' as any as Location
      },
    })

  const { disabled, error: passwordError } = validatePassword(password, confirm)

  const onSubmit = (e) => {
    e.preventDefault()
    if (!disabled) {
      mutation()
    }
  }

  if (!data) return null

  return (
    <LoginPortal>
      <Title1H1
        css={{
          textAlign: 'center',
          marginBottom: theme.spacing.xlarge,
        }}
      >
        Reset password
      </Title1H1>
      {realized && realized.realizeResetToken && (
        <Alert
          status={AlertStatus.SUCCESS}
          header="Password updated!"
          description="log back in to complete the process"
        />
      )}
      {error && (
        <GqlError
          header="Failed!"
          error={error}
        />
      )}
      <form onSubmit={onSubmit}>
        <Flex
          direction="column"
          marginBottom="small"
          gap="small"
        >
          <LabelledInput
            label="Email"
            disabled
            value={data.resetToken?.user.email}
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
          width="100%"
          loading={loading}
          disabled={disabled}
        >
          Reset password
        </Button>
      </form>
    </LoginPortal>
  )
}
