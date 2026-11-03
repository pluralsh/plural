import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button, Flex, SuccessIcon } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

import {
  ResetTokenType,
  useCreateResetTokenMutation,
} from '../../generated/graphql'
import { isValidEmail } from '../../utils/email'
import { GqlError } from '../utils/Alert'
import { SpanSC, Title1H1 } from '../utils/Typography'

import { LoginPortal } from './LoginPortal'
import { LabelledInput } from './LabelledInput'
import { InlineLinkSC } from '../utils/Typography'

export function RequestPasswordReset() {
  const theme = useTheme()
  const location = useLocation()
  const [attributes, setAttributes] = useState({
    email: location?.state?.email || '',
    type: ResetTokenType.Password,
  })
  const [mutation, { loading, data, error }] = useCreateResetTokenMutation({
    variables: { attributes },
  })

  const resetSuccess = data && data.createResetToken
  const invalidEmail = error?.message === 'not_found'
  const gqlError = !invalidEmail ? error : undefined
  const disabled = !isValidEmail(attributes.email)
  const onSubmit = (e) => {
    e.preventDefault()
    if (!disabled) {
      mutation()
    }
  }

  return (
    <LoginPortal>
      {resetSuccess ? (
        <RequestResetSuccess />
      ) : (
        <>
          <Title1H1
            css={{
              textAlign: 'center',
              marginBottom: theme.spacing.xlarge,
            }}
          >
            Reset password
          </Title1H1>
          {gqlError && (
            <div css={{ marginBottom: theme.spacing.medium }}>
              <GqlError
                header="Failed!"
                error={error}
              />
            </div>
          )}
          <form onSubmit={onSubmit}>
            <LabelledInput
              value={attributes.email}
              label="Email"
              placeholder="your email"
              onChange={(email) => setAttributes({ ...attributes, email })}
              hint={
                invalidEmail ? (
                  <SpanSC $color="text-danger-light">
                    Invalid email address
                  </SpanSC>
                ) : undefined
              }
              inputProps={{ error: invalidEmail }}
            />
            <Button
              type="submit"
              width="100%"
              loading={loading}
              disabled={disabled}
            >
              Reset Password
            </Button>
          </form>
        </>
      )}
    </LoginPortal>
  )
}

function RequestResetSuccess() {
  const theme = useTheme()

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
    >
      <SuccessIcon
        color="icon-success"
        size={32}
        marginBottom="large"
      />
      <div css={{ marginBottom: theme.spacing.xlarge }}>
        <Title1H1>Password reset email sent</Title1H1>
        <p>Check your email to continue the process.</p>
      </div>
      <InlineLinkSC to="/login">Back to login</InlineLinkSC>
    </Flex>
  )
}
