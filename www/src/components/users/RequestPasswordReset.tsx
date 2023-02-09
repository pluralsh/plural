import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Form } from 'grommet'
import {
  A,
  Button,
  Div,
  Flex,
  H1,
  P,
  Span,
} from 'honorable'
import { SuccessIcon } from '@pluralsh/design-system'

import { ResetTokenType, useCreateResetTokenMutation } from '../../generated/graphql'
import { isValidEmail } from '../../utils/email'
import { GqlError } from '../utils/Alert'

import { LoginPortal } from './LoginPortal'
import { LabelledInput } from './LabelledInput'

export function RequestPasswordReset() {
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
  const onSubmit = e => {
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
          <H1
            title1
            textAlign="center"
            marginBottom="xlarge"
          >
            Reset password
          </H1>
          {gqlError && (
            <Div marginBottom="medium">
              <GqlError
                header="Failed!"
                error={error}
              />
            </Div>
          )}
          <Form onSubmit={onSubmit}>
            <LabelledInput
              width="100%"
              value={attributes.email}
              label="Email"
              name="email"
              placeholder="your email"
              onChange={email => setAttributes({ ...attributes, email })}
              hint={
                invalidEmail ? (
                  <Span color="text-danger-light">Invalid email address</Span>
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
          </Form>
        </>
      )}
    </LoginPortal>
  )
}

function RequestResetSuccess() {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
    >
      <SuccessIcon
        color="icon-success"
        size={32}
        marginBottom="large"
      />
      <Div marginBottom="xlarge">
        <H1 title1>Password reset email sent</H1>
        <P>Check your email to continue the process.</P>
      </Div>
      <A
        inline
        as={Link}
        to="/login"
      >
        Back to login
      </A>
    </Flex>
  )
}
