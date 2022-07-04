import { useCallback, useContext, useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Box, Layer, Text } from 'grommet'
import { Reload as Refresh } from 'forge-core'
import { CircleAlert, Close } from 'grommet-icons'

import moment from 'moment'

import { useParams } from 'react-router-dom'

import { CurrentUserContext } from '../login/CurrentUser'
import { Icon } from '../accounts/Group'

import { Alert, AlertStatus, GqlError } from '../utils/Alert'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { CREATE_RESET_TOKEN, REALIZE_TOKEN } from './queries'
import { ResetTokenType } from './types'

import { LoginPortal } from './MagicLogin'

export function EmailConfirmed() {
  const { id } = useParams()
  const [mutation, { data, error }] = useMutation(REALIZE_TOKEN, {
    variables: { id, attributes: {} },
    onCompleted: () => {
      setTimeout(() => {
        window.location = '/'
      }, 2000)
    },
  })

  useEffect(() => {
    mutation()
  }, [mutation])

  return (
    <LoginPortal>
      <Box
        gap="small"
        width="400px"
      >
        {!data && !error && <LoopingLogo scale="0.75" />}
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
      </Box>
    </LoginPortal>
  )
}

export function VerifyEmailConfirmed() {
  const [open, setOpen] = useState(true)
  const me = useContext(CurrentUserContext)
  const [mutation] = useMutation(CREATE_RESET_TOKEN, {
    variables: { attributes: { email: me.email, type: ResetTokenType.EMAIL } },
    onCompleted: () => setOpen(false),
  })

  const close = useCallback(() => setOpen(false), [setOpen])

  if (me.emailConfirmed || me.serviceAccount || !open) return null

  return (
    <Layer
      plain
      modal={false}
      position="top"
      margin={{ top: 'medium' }}
      onEsc={close}
      onClickOutside={close}
    >
      <Box
        round="xsmall"
        direction="row"
        gap="small"
        background="plrl-white"
        pad="small"
        align="center"
        border={{ color: 'border' }}
      >
        <Box
          flex={false}
          align="center"
        >
          <CircleAlert
            size="medium"
            color="error"
          />
        </Box>
        <Box
          fill="horizontal"
          align="center"
        >
          <Text
            size="small"
            weight={500}
          >Your email is not confirmed
          </Text>
          {me.emailConfirmBy && <Text size="small">you have {moment(me.emailConfirmBy).fromNow(true)} to confirm your email</Text>}
        </Box>
        <Box
          flex={false}
          gap="xsmall"
          direction="row"
          align="center"
        >
          <Icon
            icon={Refresh}
            tooltip="Resend"
            onClick={mutation}
          />
          <Icon
            icon={Close}
            tooltip="Close"
            onClick={() => setOpen(false)}
          />
        </Box>
      </Box>
    </Layer>
  )
}
