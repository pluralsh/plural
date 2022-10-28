import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { Box, Form, Keyboard } from 'grommet'
import {
  Button,
  Div,
  H1,
  P,
} from 'honorable'

import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { PasswordStatus, disableState } from '../Login'

import { wipeToken } from '../../helpers/authentication'

import { ResetTokenType } from './types'
import { CREATE_RESET_TOKEN, REALIZE_TOKEN, RESET_TOKEN } from './queries'
import { LabelledInput, LoginPortal } from './MagicLogin'

export function ResetPassword() {
  const { id } = useParams()
  const [attributes, setAttributes] = useState({ password: '' })
  const [confirm, setConfirm] = useState('')
  const { data } = useQuery(RESET_TOKEN, { variables: { id } })
  const [mutation, { loading, data: realized, error }] = useMutation(REALIZE_TOKEN, {
    variables: { id, attributes },
    onCompleted: () => {
      wipeToken()
      window.location = '/login' as any as Location
    },
  })

  const { disabled, reason } = disableState(attributes.password, confirm)

  if (!data) return null

  return (
    <LoginPortal>
      <Div
        gap="small"
        width="400px"
      >
        <Div marginBottom="xxlarge">
          <H1 title1>
            Reset your password
          </H1>
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
        <Keyboard onEnter={() => mutation()}>
          <Form onSubmit={() => mutation()}>
            <Box
              margin={{ bottom: 'small' }}
              gap="small"
            >
              <LabelledInput
                width="100%"
                label="Email"
                name="email"
                value={data.resetToken.user.email}
              />
              <LabelledInput
                label="Password"
                type="password"
                value={attributes.password}
                onChange={password => setAttributes({ ...attributes, password })}
                placeholder="a strong password"
                caption="10 character minimum"
                hint={reason === 'Password is too short' && (
                  <P
                    caption
                    color="text-error"
                  >
                    Password is too short
                  </P>
                )}
              />
              <LabelledInput
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={setConfirm}
                placeholder="confirm your password"
                hint={reason === 'Passwords do not match' && (
                  <P
                    caption
                    color="text-error"
                  >
                    Password doesn't match
                  </P>
                )}
              />
            </Box>

            <PasswordStatus
              disabled={disabled}
              reason={reason}
            />
            <Button
              width="100%"
              onClick={() => mutation()}
              loading={loading}
              disabled={disabled}
            >
              Reset password
            </Button>
          </Form>
        </Keyboard>
      </Div>
    </LoginPortal>
  )
}

export function PasswordReset() {
  const [attributes, setAttributes] = useState({ email: '', type: ResetTokenType.PASSWORD })
  const [mutation, { loading, data, error }] = useMutation(CREATE_RESET_TOKEN, { variables: { attributes } })

  const reset = data && data.createResetToken

  return (
    <LoginPortal>
      <Div marginBottom="xxlarge">
        <H1 title1>
          Reset your password
        </H1>
      </Div>
      {reset && (
        <Div marginBottom="medium">
          <Alert
            status={AlertStatus.SUCCESS}
            header="Password reset email sent"
            description="Check your inbox for the reset link to complete your password reset"
          />
        </Div>
      )}
      {error && (
        <Div marginBottom="medium">
          <GqlError
            header="Failed!"
            error={error}
          />
        </Div>
      )}
      <Keyboard onEnter={() => mutation()}>
        <Form onSubmit={() => mutation()}>

          <LabelledInput
            width="100%"
            value={attributes.email}
            label="Email"
            name="email"
            placeholder="your email"
            onChange={email => setAttributes({ ...attributes, email })}
          />
          <Button
            width="100%"
            onClick={() => mutation()}
            loading={loading}
          >
            Reset Password
          </Button>
        </Form>
      </Keyboard>
    </LoginPortal>
  )
}
