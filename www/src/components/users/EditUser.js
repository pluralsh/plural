import { createContext, useContext, useEffect, useState } from 'react'
import { Button, Div } from 'honorable'
import { Box, Text } from 'grommet'
import {
  InputCollection,
  Select,
} from 'forge-core'
import { useMutation, useQuery } from '@apollo/client'
import { Checkmark, StatusCritical } from 'grommet-icons'
import { useNavigate, useParams } from 'react-router-dom'

import ResponsiveInput from '../ResponsiveInput'
import { CurrentUserContext } from '../login/CurrentUser'
import { BreadcrumbsContext } from '../Breadcrumbs'

import { SectionContentContainer, SectionPortal } from '../Explore'

import { SectionChoice } from '../utils/SectionChoice'
import { Provider } from '../repos/misc'
import { Attribute, Attributes } from '../integrations/Webhook'

import { host } from '../../helpers/hostname'

import { OauthEnabler } from './OauthEnabler'
import { EabCredentials } from './EabCredentials'
import { Tokens } from './Tokens'
import { LoginMethod } from './types'
import { OAUTH_URLS, UPDATE_USER } from './queries'
import { Keys } from './Keys'

export const EditContext = createContext({})

export function EditSelect({ name, edit, icon, base }) {
  const { editing } = useParams()
  const navigate = useNavigate()

  return (
    <SectionChoice
      name={name}
      label={name}
      icon={icon}
      onClick={edit === editing ? null : () => navigate(`${base || '/user/edit/'}${edit}`)}
      selected={editing === edit}
    />
  )
}

export function EditHeader({ text }) {
  return (
    <Box
      fill="horizontal"
      direction="row"
      justify="center"
      margin={{ bottom: 'small' }}
    >
      <Text
        size="small"
        weight={500}
      >{text}
      </Text>
    </Box>
  )
}

export function EditContent({ edit, name, children }) {
  const { editing } = useParams()
  if (editing !== edit) return null

  return (
    <SectionContentContainer header={name}>
      {children}
    </SectionContentContainer>
  )
}

function passwordValid(password, confirm) {
  if (password === '') return { disabled: true, reason: 'Please enter a password' }
  if (password !== confirm) return { disabled: true, reason: 'Passwords must match' }
  if (password.length < 12) return { disabled: true, reason: 'Passwords must be more than 12 characters' }

  return { disabled: false, reason: 'passwords match!' }
}

export default function EditUser() {
  const me = useContext(CurrentUserContext)
  const [attributes, setAttributes] = useState({ name: me.name, email: me.email, loginMethod: me.loginMethod })
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const { editing } = useParams()
  const mergedAttributes = password && password.length > 0 ? { ...attributes, password } : attributes
  const [mutation, { loading }] = useMutation(UPDATE_USER, { variables: { attributes: mergedAttributes } })
  const { disabled, reason } = passwordValid(password, confirm)
  const { data } = useQuery(OAUTH_URLS, { variables: { host: host() } })
  const color = disabled ? 'status-error' : 'status-ok'

  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([{ url: '/user/edit', text: 'me' }, { url: `/user/edit/${editing}`, text: editing }])
  }, [setBreadcrumbs, editing])

  return (
    <Box fill>
      <EditContent
        edit="user"
        name="User Attributes"
      >
        <Box
          pad="small"
          gap="small"
        >
          <InputCollection>
            <ResponsiveInput
              label="name"
              labelWidth={64 + 4}
              value={attributes.name}
              onChange={({ target: { value } }) => setAttributes({ ...attributes, name: value })}
            />
            <Div mt={0.5}>
              <ResponsiveInput
                label="email"
                labelWidth={64 + 4}
                value={attributes.email}
                onChange={({ target: { value } }) => setAttributes({ ...attributes, email: value })}
              />
            </Div>
          </InputCollection>
          <Attributes width="50%">
            {me.provider && (
              <Attribute name="Provider">
                <Provider
                  provider={me.provider}
                  width={40}
                />
              </Attribute>
            )}

            <Attribute name="Login Method">
              <Select
                name="login-method"
                value={{ value: attributes.loginMethod, label: attributes.loginMethod.toLocaleLowerCase() }}
                onChange={({ value }) => setAttributes({ ...attributes, loginMethod: value })}
                options={Object.values(LoginMethod).map(m => ({
                  label: m.toLocaleLowerCase(),
                  value: m,
                }))}
              />
            </Attribute>
            {data && data.oauthUrls.map((url, i) => (
              <OauthEnabler
                url={url}
                me={me}
                key={url + i}
              />
            ))}
          </Attributes>
          <SectionPortal>
            <Button
              loading={loading}
              onClick={mutation}
              flexShrink={0}
            >
              Update
            </Button>
          </SectionPortal>
        </Box>
      </EditContent>
      <EditContent
        edit="pwd"
        name="Password"
      >
        <Box pad="small">
          <form
            autoComplete="off"
            onSubmit={disabled ? null : mutation}
          >
            <InputCollection>
              <ResponsiveInput
                labelWidth={64 + 32 - 8}
                value={password}
                label="password"
                placeholder="a long password"
                type="password"
                onChange={({ target: { value } }) => setPassword(value)}
              />
              <Div mt={0.5}>
                <ResponsiveInput
                  labelWidth={64 + 32 - 8}
                  value={confirm}
                  label="confirm"
                  placeholder="confirm your password"
                  type="password"
                  onChange={({ target: { value } }) => setConfirm(value)}
                />
              </Div>
            </InputCollection>
          </form>
          <SectionPortal>
            <Box
              flex={false}
              gap="small"
              direction="row"
              align="center"
            >
              {disabled ? (
                <StatusCritical
                  size="15px"
                  color={color}
                />
              ) : (
                <Checkmark
                  size="15px"
                  color={color}
                />
              )}
              <Text
                size="small"
                color={color}
              >
                {reason}
              </Text>
              <Button
                ml={0.5}
                disabled={disabled}
                loading={loading}
                onClick={mutation}
              >
                Update
              </Button>
            </Box>
          </SectionPortal>
        </Box>
      </EditContent>
      <EditContent
        edit="tokens"
        name="Tokens"
      >
        <Tokens />
      </EditContent>
      <EditContent
        edit="keys"
        name="Public Keys"
      >
        <Keys />
      </EditContent>
      <EditContent
        edit="credentials"
        name="Eab Credentials"
      >
        <EabCredentials />
      </EditContent>
    </Box>
  )
}
