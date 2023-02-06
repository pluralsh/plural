import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
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

import {
  ResetTokenType,
  useCreateResetTokenMutation,
  useRealizeResetTokenMutation,
  useResetTokenQuery,
} from '../../generated/graphql'

import { wipeToken } from '../../helpers/authentication'
import { isMinViableEmail } from '../../utils/string'

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

  console.log('name', error?.name)
  console.log('message', error?.message)
  console.log('extraInfo', error?.extraInfo)
  console.log('cause', error?.cause)

  const invalidEmail = error?.message === 'not_found'
  const gqlError = !invalidEmail ? error : undefined

  return (
    <LoginPortal>
      {resetSuccess ? (
        <RequestResetSuccess />
      ) : (
        <>
          <Div marginBottom="xlarge">
            <H1
              title1
              textAlign="center"
            >
              Reset password
            </H1>
          </Div>
          {gqlError && (
            <Div marginBottom="medium">
              <GqlError
                header="Failed!"
                error={error}
              />
            </Div>
          )}
          <Form onSubmit={() => mutation()}>
            <LabelledInput
              width="100%"
              value={attributes.email}
              label="Email"
              name="email"
              placeholder="your email"
              onChange={email => setAttributes({ ...attributes, email })}
              hint={invalidEmail ? <Span color="text-danger-light">Invalid email address</Span> : undefined}
              inputProps={{ error: invalidEmail }}
            />
            <Button
              type="submit"
              width="100%"
              loading={loading}
              disabled={!isMinViableEmail(attributes.email)}
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
