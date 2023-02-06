import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Form } from 'grommet'
import { Button, Flex, H1 } from 'honorable'

import { useRealizeResetTokenMutation, useResetTokenQuery } from '../../generated/graphql'

import { wipeToken } from '../../helpers/authentication'

import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { validatePassword } from '../Login'

import { LoginPortal } from './LoginPortal'
import { LabelledInput } from './LabelledInput'
import { ConfirmPasswordField, SetPasswordField } from './Signup'

export function ResetPassword() {
  const { id } = useParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const { data } = useResetTokenQuery({ variables: { id: id ?? '' } })
  const [mutation, { loading, data: realized, error }]
    = useRealizeResetTokenMutation({
      variables: { id: id ?? '', attributes: { password } },
      onCompleted: () => {
        wipeToken()
        window.location = '/login' as any as Location
      },
    })

  const {
    disabled,
    error: passwordError,
  } = validatePassword(password, confirm)

  const onSubmit = () => {
    if (!disabled) {
      mutation()
    }
  }

  if (!data) return null

  return (
    <LoginPortal>
      <H1
        title1
        textAlign="center"
        marginBottom="xlarge"
      >
        Reset password
      </H1>
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
      <Form onSubmit={onSubmit}>
        <Flex
          flexDirection="column"
          marginBottom="small"
          gap="small"
        >
          <LabelledInput
            width="100%"
            label="Email"
            name="email"
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
      </Form>
    </LoginPortal>
  )
}
