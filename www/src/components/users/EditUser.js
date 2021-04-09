import React, { useContext, useState, useEffect } from 'react'
import { Box, Text } from 'grommet'
import { useFilePicker } from 'react-sage'
import { Button, InputCollection, ResponsiveInput } from 'forge-core'
import { useMutation } from 'react-apollo'
import { UPDATE_USER } from './queries'
import Avatar from './Avatar'
import { wipeToken } from '../../helpers/authentication'
import { Logout, StatusCritical, Checkmark, User, Lock, Install, Robot } from 'grommet-icons'
import Installations from '../repos/Installations'
import { CurrentUserContext } from '../login/CurrentUser'
import { Tokens } from './Tokens'
import { useHistory, useParams } from 'react-router'
import { BreadcrumbsContext } from '../Breadcrumbs'

export const EditContext = React.createContext({})

function EditAvatar({me}) {
  const {files, onClick, HiddenFileInput} = useFilePicker({})
  const [mutation] = useMutation(UPDATE_USER)
  useEffect(() => {
    if (files.length > 0) {
      mutation({variables: {attributes: {avatar: files[0]}}})
    }
  }, [files])

  return (
    <>
      <Avatar user={me} size='80px' onClick={onClick} />
      <HiddenFileInput accept='.jpg, .jpeg, .png' multiple={false} />
    </>
  )
}

function ActionBox({onClick, text, icon}) {
  return (
    <Box pad={{vertical: 'xsmall', horizontal: 'small'}} background='white' direction='row' round='xsmall'
         border={{color: 'light-4', side: 'all'}} align='center'
         justify='end' hoverIndicator='light-3' onClick={onClick}>
      <Box fill='horizontal' align='center'>
        <Text size='small' weight={500}>{text}</Text>
      </Box>
      <Box width='50px' direction='row' justify='end'>
        {icon}
      </Box>
    </Box>
  )
}

export function EditSelect({name, edit, icon, base}) {
  const {editing} = useParams()
  let hist = useHistory()
  return (
    <Box pad={{horizontal: 'small', vertical: 'xsmall'}} round='xsmall'
         border={{color: edit === editing ? 'brand' : 'light-5'}} fill='horizontal'
         align='center' gap='small' direction='row' hoverIndicator='light-2'
         focusIndicator={false} onClick={edit === editing ? null : () => hist.push(`${base || '/me/edit/'}${edit}`)}>
      <Box fill='horizontal'>
        {name}
      </Box>
      <Box flex={false}>
        {icon}
      </Box>
    </Box>
  )
}

export function EditHeader({text}) {
  return (
    <Box fill='horizontal' direction='row' justify='center' margin={{bottom: 'small'}}>
      <Text size='small' weight={500}>{text}</Text>
    </Box>
  )
}

export function EditContent({edit, children}) {
  const {editing} = useParams()
  if (editing !== edit) return null

  return (
    <Box pad={{horizontal: 'small'}} fill>
      <EditHeader text={edit} />
      {children}
    </Box>
  )
}

function passwordValid(password, confirm) {
  if (password === '') return {disabled: true, reason: 'please enter a password'}
  if (password !== confirm) return {disabled: true, reason: 'passwords must match'}
  if (password.length < 12) return {disabled: true, reason: 'passwords must be more than 12 characters'}
  return {disabled: false, reason: 'passwords match!'}
}

export default function EditUser() {
  const me = useContext(CurrentUserContext)
  const [attributes, setAttributes] = useState({name: me.name, email: me.email})
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const {editing} = useParams()
  const mergedAttributes = password && password.length > 0 ? {...attributes, password} : attributes
  const [mutation, {loading}] = useMutation(UPDATE_USER, {variables: {attributes: mergedAttributes}})
  const {disabled, reason} = passwordValid(password, confirm)
  const color = disabled ? 'status-error' : 'status-ok'

  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([{url: `/me/edit`, text: 'me'}, {url: `/me/edit/${editing}`, text: editing}])
  }, [setBreadcrumbs, editing])

  return (
    <Box fill gap='small' pad='medium'>
      <Box direction='row' align='center' gap='medium' pad='medium'>
        <EditAvatar me={me} />
        <Box flex={false}>
          <Text>{attributes.name}</Text>
          <Text size='small'>{attributes.email}</Text>
        </Box>
        <Box fill direction='row' align='center' justify='end'>
          <ActionBox
            text='logout'
            onClick={() => {
              wipeToken()
              window.location = '/login'
            }}
            icon={<Logout size='12px' />} />
        </Box>
      </Box>
      <Box fill direction='row' border={{side: 'between', color: 'light-5'}} gap='small'>
        <Box gap='small' width='25%' pad={{horizontal: 'small', vertical: 'medium'}}>
          <EditSelect edit='user' name='User Attributes' icon={<User size='small' />} />
          <EditSelect edit='pwd' name='Password' icon={<Lock size='small' />} />
          <EditSelect edit='installations' name='Installations' icon={<Install size='small' />} />
          <EditSelect edit='tokens' name='Access Tokens' icon={<Robot size='small' />} />
        </Box>
        <Box width='75%'>
          <EditContent edit='user'>
            <InputCollection>
              <ResponsiveInput
                value={attributes.name}
                label='name'
                onChange={({target: {value}}) => setAttributes({...attributes, name: value})} />
              <ResponsiveInput
                value={attributes.email}
                label='email'
                onChange={({target: {value}}) => setAttributes({...attributes, email: value})} />
            </InputCollection>
            <Box direction='row' justify='end'>
              <Button loading={loading} onClick={mutation} flex={false} label='Update' />
            </Box>
          </EditContent>
          <EditContent edit='pwd'>
            <InputCollection>
              <ResponsiveInput
                value={password}
                label='password'
                type='password'
                onChange={({target: {value}}) => setPassword(value)} />
              <ResponsiveInput
                value={confirm}
                label='confirm'
                type='password'
                onChange={({target: {value}}) => setConfirm(value)} />
            </InputCollection>
            <Box direction='row' justify='end' align='center'>
              <Box fill='horizontal' align='center' direction='row' gap='small'>
                {disabled ?
                  <StatusCritical size='15px' color={color} /> :
                  <Checkmark size='15px' color={color} />}
                <Text size='small' color={color}>
                  {reason}
                </Text>
              </Box>
              <Button
                disabled={disabled}
                loading={loading}
                onClick={mutation}
                label='Update' />
            </Box>
          </EditContent>
          <EditContent edit='installations'>
            <Installations edit />
          </EditContent>
          <EditContent edit='tokens'>
            <Tokens />
          </EditContent>
        </Box>
      </Box>
    </Box>
  )
}