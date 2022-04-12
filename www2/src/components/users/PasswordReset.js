import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { Box, Form, Keyboard, Text } from 'grommet'
import { Button } from 'forge-core'

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
      window.location = '/login'
    },
  })

  const { disabled, reason } = disableState(attributes.password, confirm)

  if (!data) return null

  return (
    <LoginPortal>
      <Box
        gap="small"
        width="400px"
      >
        <Box
          pad={{ vertical: 'xsmall' }}
          align="center"
        >
          <Text size="large">Reset your password</Text>
        </Box>
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
        <Keyboard onEnter={mutation}>
          <Form onSubmit={mutation}>
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
                width="100%"
                label="Password"
                type="password"
                placeholder="a strong password"
                value={attributes.password}
                onChange={password => setAttributes({ ...attributes, password })}
              />
              <LabelledInput
                width="100%"
                label="Confim Password"
                type="password"
                placeholder="confirm your password"
                value={confirm}
                onChange={setConfirm}
              />
            </Box>
            <Box
              direction="row"
              align="center"
              justify="end"
              gap="small"
            >
              <PasswordStatus
                disabled={disabled}
                reason={reason}
              />
              <Button
                onClick={mutation}
                loading={loading}
                label="Reset Password"
              />
            </Box>
          </Form>
        </Keyboard>
      </Box>
    </LoginPortal>
  )
}

export function PasswordReset() {
  const [attributes, setAttributes] = useState({ email: '', type: ResetTokenType.PASSWORD })
  const [mutation, { loading, data, error }] = useMutation(CREATE_RESET_TOKEN, { variables: { attributes } })

  const reset = data && data.createResetToken

  return (
    <LoginPortal>
      <Box
        pad="medium"
        gap="small"
        width="400px"
      >
        <Box
          pad={{ vertical: 'xsmall' }}
          align="center"
        >
          <Text size="large">Reset your password</Text>
        </Box>
        {reset && (
          <Alert
            status={AlertStatus.SUCCESS}
            header="Password reset email sent"
            description="Check your inbox for the reset link to complete your password reset"
          />
        )}
        {error && (
          <GqlError
            header="Failed!"
            error={error}
          />
        )}
        <Keyboard onEnter={mutation}>
          <Form onSubmit={mutation}>
            <Box
              gap="small"
              fill="horizontal"
            >
              <LabelledInput
                width="100%"
                value={attributes.email}
                label="Email"
                name="email"
                placeholder="your email"
                onChange={email => setAttributes({ ...attributes, email })}
              />
              <Button
                onClick={mutation}
                loading={loading}
                fill="horizontal"
                size="small"
                round="xsmall"
                pad={{ vertical: 'xsmall', horizontal: 'medium' }}
                label="Reset Password"
              />
            </Box>
          </Form>
        </Keyboard>
      </Box>
    </LoginPortal>
  )
}
