import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Form } from 'grommet'
import {
  Button,
  Div,
  Flex,
  H1,
} from 'honorable'

import { useRealizeResetTokenMutation, useResetTokenQuery } from '../../generated/graphql'

import { wipeToken } from '../../helpers/authentication'

import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { PasswordStatus, disableState } from '../Login'

import { LabelledInput, LoginPortal } from './MagicLogin'
import { ConfirmPasswordField, SetPasswordField } from './Signup'

export function ResetPassword() {
  const { id } = useParams()
  const [attributes, setAttributes] = useState({ password: '' })
  const [confirm, setConfirm] = useState('')
  const { data } = useResetTokenQuery({ variables: { id: id ?? '' } })
  const [mutation, { loading, data: realized, error }]
    = useRealizeResetTokenMutation({
      variables: { id: id ?? '', attributes },
      onCompleted: () => {
        wipeToken()
        window.location = '/login' as any as Location
      },
    })

  const {
    disabled,
    reason,
    error: passwordError,
  } = disableState(attributes.password, confirm)

  if (!data) return null

  return (
    <LoginPortal>
      <Div
        gap="small"
        width="400px"
      >
        <Div marginBottom="xxlarge">
          <H1 title1>Reset password</H1>
        </Div>
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
        <Form onSubmit={() => mutation()}>
          <Flex
            flexDirection="column"
            marginBottom="small"
            gap="small"
          >
            <LabelledInput
              width="100%"
              label="Email"
              name="email"
              value={data.resetToken?.user.email}
            />
            <SetPasswordField
              value={attributes.password}
              onChange={password => setAttributes({ ...attributes, password })}
              errorCode={passwordError}
            />
            <ConfirmPasswordField
              value={confirm}
              onChange={setConfirm}
              errorCode={passwordError}
            />
          </Flex>

          <PasswordStatus
            disabled={disabled}
            reason={reason}
          />
          <Button
            width="100%"
            loading={loading}
            disabled={disabled}
          >
            Reset password
          </Button>
        </Form>
      </Div>
    </LoginPortal>
  )
}
