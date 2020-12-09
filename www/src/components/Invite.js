import React, { useState } from 'react'
import { gql } from 'apollo-boost'
import { useParams } from 'react-router'
import { useMutation, useQuery } from 'react-apollo'
import { Box, Keyboard, FormField, TextInput, Text } from 'grommet'
import { Button, InputCollection, ResponsiveInput, SecondaryButton } from 'forge-core'
import { StatusCritical, Checkmark } from 'grommet-icons'
import { initials } from './users/Avatar'
import { setToken } from '../helpers/auth'

const SIGNUP = gql`
  mutation Signup($attributes: UserAttributes!, $inviteId: ID!) {
    signup(attributes: $attributes, inviteId: $inviteId) {
      jwt
    }
  }
`;

const INVITE_Q = gql`
  query Invite($id: ID!) {
    invite(id: $id) {
      email
    }
  }
`;

function InvalidInvite() {
  return (
    <Box width='100vw' height='100vh' justify='center' align='center'>
      <Box>
        <Text>That invite code is no longer valid</Text>
      </Box>
    </Box>
  )
}

export function disableState(password, confirm) {
  if (password.length === 0) return {disabled: true, reason: 'enter a password'}
  if (password.length < 10) return {disabled: true, reason: 'password is too short'}
  if (password !== confirm) return {disabled: true, reason: 'passwords do not match'}
  return {disabled: false, reason: 'passwords match!'}
}

function DummyAvatar({name, size: given}) {
  const size = given || '50px'
  return (
    <Box flex={false} round='xsmall' align='center' justify='center' width={size} height={size} background='#6b5b95'>
      <Text size='small'>{initials(name)}</Text>
    </Box>
  )
}

export function PasswordStatus({disabled, reason}) {
  return (
    <Box direction='row' fill='horizontal' align='center' gap='xsmall'>
      {disabled ? <StatusCritical color='notif' size='12px' /> : <Checkmark color='status-ok' size='12px' />}
      <Text size='small' color={disabled ? 'notif' : 'status-ok'}>{reason}</Text>
    </Box>
  )
}

export default function Invite() {
  const {inviteId} = useParams()
  const [attributes, setAttributes] = useState({name: '', password: ''})
  const [confirm, setConfirm] = useState('')
  const [editPassword, setEditPassword] = useState(false)
  const [mutation, {loading}] = useMutation(SIGNUP, {
    variables: {inviteId, attributes},
    onCompleted: ({signUp: {jwt}}) => {
      setToken(jwt)
      window.location = '/'
    }
  })
  const {data, error} = useQuery(INVITE_Q, {variables: {id: inviteId}})

  if (error) return <InvalidInvite />
  if (!data) return null

  const {disabled, reason} = disableState(attributes.password, confirm)
  const email = data.invite.email
  const filled = attributes.name.length > 0

  return (
    <Box align="center" justify="center" height="100vh" background='backgroundColor'>
      <Box width="60%" pad='medium' background='white'>
        <Keyboard onEnter={editPassword && filled ? mutation : null}>
          <Box gap='small'>
            <Box justify='center' align='center'>
              <Text weight="bold">Accept your invite</Text>
            </Box>
            <Box direction='row' gap='small' align='center'>
              <DummyAvatar name={attributes.name} />
              <Box>
                <Text size='small' weight={500}>{attributes.name}</Text>
                <Text size='small' color='dark-3'>{email}</Text>
              </Box>
            </Box>
            {editPassword ? (
              <Box animation={{type: 'fadeIn', duration: 500}}>
                <InputCollection>
                  <ResponsiveInput
                    type='password'
                    label='password'
                    value={attributes.password}
                    placeholder='battery horse fire stapler'
                    onChange={({target: {value}}) => setAttributes({...attributes, password: value})} />
                  <ResponsiveInput
                    type='password'
                    label='confirm'
                    value={confirm}
                    placeholder='type it again'
                    onChange={({target: {value}}) => setConfirm(value)} />
                </InputCollection>
              </Box>
            ) : (
              <Box animation={{type: 'fadeIn', duration: 500}}>
                <FormField label='email' disabled>
                  <TextInput value={email} />
                </FormField>
                <FormField label='name'>
                  <TextInput
                    value={attributes.name}
                    placeholder='John Doe'
                    onChange={({target: {value}}) => setAttributes({...attributes, name: value})} />
                </FormField>
              </Box>
            )}
            <Box direction='row' justify='end' align='center'>
              {editPassword && (<PasswordStatus disabled={disabled} reason={reason} />)}
              <Box flex={false} direction='row' gap='small'>
                {editPassword && (<SecondaryButton
                  label='Go Back'
                  onClick={() => setEditPassword(false)} />)}
                <Button
                  loading={loading}
                  disabled={editPassword ? disabled : !filled}
                  label={editPassword ? 'Sign up' : 'continue'}
                  onClick={editPassword ? mutation : () => setEditPassword(true)} />
              </Box>
            </Box>
          </Box>
        </Keyboard>
      </Box>
    </Box>
  )
}