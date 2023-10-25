import { Switch, Tab, TabList, TabPanel } from '@pluralsh/design-system'
import { useCallback, useRef, useState } from 'react'

import { useTheme } from 'styled-components'

import { GqlError } from '../utils/Alert'

import { List, ListItem } from '../utils/List'

import { PermissionTypes } from './types'

import { GeneralAttributes } from './Role'

function PermissionToggle({
  permission,
  description,
  attributes,
  setAttributes,
  first,
  last,
}: any) {
  const theme = useTheme()
  const toggle = useCallback(
    (enable) => {
      if (enable) {
        setAttributes({
          ...attributes,
          permissions: [permission, ...attributes.permissions],
        })
      } else {
        setAttributes({
          ...attributes,
          permissions: attributes.permissions.filter(
            (perm) => perm !== permission
          ),
        })
      }
    },
    [permission, attributes, setAttributes]
  )

  return (
    <ListItem
      first={first}
      last={last}
    >
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <h4
          className="stuff"
          css={{
            ...theme.partials.text.body1Bold,
            margin: 0,
          }}
        >
          {permission.toLowerCase()}
        </h4>
        <p
          css={{
            ...theme.partials.text.body2,
            color: theme.colors['text-light'],
            margin: 0,
          }}
          color="text-light"
        >
          {description}
        </p>
      </div>
      <Switch
        checked={!!attributes.permissions.find((perm) => perm === permission)}
        onChange={(checked) => toggle(checked)}
      />
    </ListItem>
  )
}

const TABS = {
  General: { label: 'General' },
  Permissions: { label: 'Permissions' },
}

export function RoleForm({
  error,
  attributes,
  setAttributes,
  bindings,
  setBindings,
}: {
  error: any
  attributes: any
  setAttributes: any
  bindings: any
  setBindings: any
}) {
  const theme = useTheme()
  const [view, setView] = useState('General')
  const permissions = Object.entries(PermissionTypes)
  const len = permissions.length
  const tabStateRef = useRef<any>(null)

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.medium,
      }}
    >
      {error && (
        <GqlError
          header="Something went wrong"
          error={error}
        />
      )}
      <TabList
        stateRef={tabStateRef}
        stateProps={{
          orientation: 'horizontal',
          selectedKey: view,
          onSelectionChange: (key) => setView(key as string),
        }}
      >
        {Object.entries(TABS).map(([key, { label }]) => (
          <Tab key={key}>{label}</Tab>
        ))}
      </TabList>
      <TabPanel stateRef={tabStateRef}>
        {view === 'General' && (
          <GeneralAttributes
            attributes={attributes}
            setAttributes={setAttributes}
            bindings={bindings}
            setBindings={setBindings}
          />
        )}
        {view === 'Permissions' && (
          <div
            css={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.small,
            }}
          >
            <div
              css={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.xxsmall,
              }}
            >
              <h3 css={{ ...theme.partials.text.body1Bold, margin: 0 }}>
                Permissions
              </h3>
              <p
                css={{
                  ...theme.partials.text.body2,
                  margin: 0,
                  color: theme.colors['text-light'],
                }}
              >
                Grant permissions to all users and groups bound to this role
              </p>
            </div>
            <List hue="lighter">
              {permissions.map(([perm, description], i) => (
                <PermissionToggle
                  key={perm}
                  permission={perm}
                  description={description}
                  attributes={attributes}
                  setAttributes={setAttributes}
                  first={i === 0}
                  last={i === len - 1}
                />
              ))}
            </List>
          </div>
        )}
      </TabPanel>
    </div>
  )
}
