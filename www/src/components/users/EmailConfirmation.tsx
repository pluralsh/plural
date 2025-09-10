import { Button, Flex, SendMessageIcon, Toast } from '@pluralsh/design-system'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useTheme } from 'styled-components'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import { useIsCurrentlyOnboarding } from '../shell/hooks/useOnboarded'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import LoadingIndicator from '../utils/LoadingIndicator'

import { LoginPortal } from './LoginPortal'

import {
  ResetTokenType,
  useCreateResetTokenMutation,
  useRealizeResetTokenMutation,
} from 'generated/graphql'

export const FROM_EMAIL_CONFIRMATION_KEY = 'fromEmailConfirmation'

export function EmailConfirmed() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const [mutation, { data, error }] = useRealizeResetTokenMutation({
    variables: { id, attributes: {} },
    onCompleted: () => {
      setTimeout(() => {
        navigate(`/account/edit?${FROM_EMAIL_CONFIRMATION_KEY}=true`)
      }, 2000)
    },
  })

  useEffect(() => {
    mutation()
  }, [mutation])

  return (
    <LoginPortal>
      <Flex
        direction="column"
        gap="small"
        width="400px"
      >
        {!data && !error && <LoadingIndicator />}
        {data && (
          <Alert
            status={AlertStatus.SUCCESS}
            header="Email confirmed"
            description="we'll redirect you to Plural shortly"
          />
        )}
        {error && (
          <GqlError
            header="Failed!"
            error={error}
          />
        )}
      </Flex>
    </LoginPortal>
  )
}

export function VerifyEmailConfirmed() {
  const theme = useTheme()
  const [open, setOpen] = useState(true)
  const me = useContext(CurrentUserContext)
  const [mutation] = useCreateResetTokenMutation({
    variables: { attributes: { email: me.email, type: ResetTokenType.Email } },
    onCompleted: () => setOpen(false),
  })
  const isCurrentlyOnboarding = useIsCurrentlyOnboarding()

  const close = useCallback(() => setOpen(false), [setOpen])

  if (me.emailConfirmed || me.serviceAccount || !open || isCurrentlyOnboarding)
    return null

  return (
    <Toast
      heading="Email not confirmed"
      show={open}
      onClose={close}
      position="top"
      severity="danger"
      css={{ marginTop: theme.spacing.medium }}
    >
      <Flex
        gap="small"
        direction="column"
      >
        <span>
          Please confirm your email address to continue using your Plural
          account.
        </span>
        <Button
          secondary
          startIcon={<SendMessageIcon />}
          onClick={() => mutation()}
          css={{ width: 'fit-content' }}
        >
          Resend confirmation email
        </Button>
      </Flex>
    </Toast>
  )
}
