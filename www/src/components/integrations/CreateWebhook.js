import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { Button, SecondaryButton } from 'forge-core'
import { Box, FormField, Text, TextInput } from 'grommet'

import { appendConnection, updateCache } from '../../utils/graphql'

import { ACTIONS } from './types'
import { CREATE_WEBHOOK, WEBHOOKS_Q } from './queries'

const TAB_COLORS = {
  bg: 'light-3',
  hover: 'border',
}

export function ActionTab({ action, onClick, colors }) {
  const { bg, hover } = colors || TAB_COLORS

  return (
    <Box
      key={action}
      background={bg}
      round="xsmall"
      pad={{ vertical: '2px', horizontal: 'small' }}
      hoverIndicator={hover}
      onClick={onClick}
    >
      <Text
        size="small"
        weight={500}
      >{action}
      </Text>
    </Box>
  )
}

export function ActionInput({ actions, setActions, colors }) {
  const [value, setValue] = useState('')

  return (
    <Box
      flex={false}
      fill="horizontal"
    >
      <Box
        flex={false}
        fill="horizontal"
        direction="row"
        gap="small"
        align="center"
      >
        <TextInput
          plain
          value={value}
          placeholder="add an action for this webhook"
          onSelect={({ suggestion: action }) => setActions([...actions, action])}
          suggestions={ACTIONS.filter(action => action.includes(value))}
          onChange={({ target: { value } }) => setValue(value)}
        />
      </Box>
      <Box
        flex={false}
        direction="row"
        gap="xxsmall"
        align="center"
        wrap
      >
        {actions.map(action => (
          <ActionTab
            key={action}
            action={action}
            colors={colors}
            onClick={() => setActions(actions.filter(a => a !== action))}
          />
        ))}
      </Box>
    </Box>
  )
}

export function CreateWebhook({ cancel }) {
  const [attributes, setAttributes] = useState({ name: '', url: '', actions: ['incident.create'] })
  const [mutation, { loading }] = useMutation(CREATE_WEBHOOK, {
    variables: { attributes },
    update: (cache, { data: { createIntegrationWebhook } }) => updateCache(cache, {
      query: WEBHOOKS_Q,
      update: prev => appendConnection(prev, createIntegrationWebhook, 'integrationWebhooks'),
    }),
    onCompleted: cancel,
  })

  return (
    <Box pad="small">
      <FormField label="name">
        <TextInput
          placeholder="name for the webhook"
          value={attributes.name}
          onChange={({ target: { value } }) => setAttributes({ ...attributes, name: value })}
        />
      </FormField>
      <FormField label="url">
        <TextInput
          placeholder="url to deliver to"
          value={attributes.url}
          onChange={({ target: { value } }) => setAttributes({ ...attributes, url: value })}
        />
      </FormField>
      <ActionInput
        actions={attributes.actions}
        setActions={actions => setAttributes({ ...attributes, actions })}
      />
      <Box
        direction="row"
        align="center"
        justify="end"
        gap="xsmall"
      >
        <SecondaryButton
          label="Cancel"
          onClick={cancel}
        />
        <Button
          label="Create"
          onClick={mutation}
          loading={loading}
        />
      </Box>
    </Box>
  )
}
