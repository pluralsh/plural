import React from 'react'
import { Box, Text, Form, FormField, Keyboard, TextInput } from 'grommet'
import { Button } from 'forge-core'
import { useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { CREATE_RESET_TOKEN, REALIZE_TOKEN, RESET_TOKEN } from './queries'
import { ResetTokenType } from './types'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { useParams } from 'react-router'
import { PasswordStatus, disableState } from '../Login'
import { wipeToken } from '../../helpers/authentication'

export function ResetPassword() {
  const {id} = useParams()
  const [attributes, setAttributes] = useState({password: ''})
  const [confirm, setConfirm] = useState('')
  const {data} = useQuery(RESET_TOKEN, {variables: {id}})
  const [mutation, {loading, data: realized, error}] = useMutation(REALIZE_TOKEN, {
    variables: {id, attributes},
    onCompleted: () => {
      wipeToken()
      window.location = '/login' 
    }
  })

  const {disabled, reason} = disableState(attributes.password, confirm)

  if (!data) return null

  return (
    <Box align="center" justify="center" height="100vh" background='light-1'>
      <Box width="70%" pad='medium' background='white' border={{color: 'light-3'}} gap='small'>
        <Box pad={{vertical: 'xsmall'}} align='center'>
          <Text size='small' weight={500}>Reset your password</Text>
        </Box>
        {realized && realized.realizeResetToken && (
          <Alert 
            status={AlertStatus.SUCCESS} 
            header='Password updated!' 
            description='log back in to complete the process' />
        )}
        {error && <GqlError header="Failed!" error={error} />}
        <Keyboard onEnter={mutation}>
          <Form onSubmit={mutation}>
            <Box margin={{bottom: 'small'}}>
              <FormField label='email' disabled>
                <TextInput value={data.resetToken.user.email} />
              </FormField>
              <FormField label='password'>
                <TextInput
                  type='password'
                  value={attributes.password}
                  placeholder='a strong password'
                  onChange={({target: {value}}) => setAttributes({...attributes, password: value})} />
              </FormField>
              <FormField label='confirm password'>
                <TextInput
                  type='password'
                  value={confirm}
                  placeholder='confirm your password'
                  onChange={({target: {value}}) => setConfirm(value)} />
              </FormField>
            </Box>
            <Box direction="row" align="center" justify='end' gap='small'>
              <PasswordStatus disabled={disabled} reason={reason} />
              <Button onClick={mutation} loading={loading} label='Reset Password' />
            </Box>
          </Form>
        </Keyboard>
      </Box>
    </Box>
  )
}

export function PasswordReset() {
  const [attributes, setAttributes] = useState({email: '', type: ResetTokenType.PASSWORD})
  const [mutation, {loading, data, error}] = useMutation(CREATE_RESET_TOKEN, {variables: {attributes}})

  const reset = data && data.createResetToken

  return (
    <Box align="center" justify="center" height="100vh" background='light-1'>
      <Box width="70%" pad='medium' background='white' border={{color: 'light-3'}} gap='small'>
        <Box pad={{vertical: 'xsmall'}} align='center'>
          <Text size='small' weight={500}>Reset your password</Text>
        </Box>
        {reset && (
          <Alert 
            status={AlertStatus.SUCCESS} 
            header='Password reset email sent' 
            description='Check your inbox for the reset link to complete your password reset' />
        )}
        {error && <GqlError header="Failed!" error={error} />}
        <Keyboard onEnter={mutation}>
          <Form onSubmit={mutation}>
            <Box margin={{bottom: 'small'}}>
              <FormField
                value={attributes.email}
                label="email"
                name="email"
                onChange={({target: {value}}) => setAttributes({...attributes, email: value})}
                placeholder="your email"
              />
            </Box>
            <Box direction="row" align="center" justify='end'>
              <Button
                onClick={mutation}
                loading={loading}
                size='small'
                round='xsmall'
                pad={{vertical: 'xsmall', horizontal: 'medium'}}
                label='Reset Password' />
            </Box>
          </Form>
        </Keyboard>
      </Box>
    </Box>
  )
}