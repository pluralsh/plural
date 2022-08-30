import { Box } from 'grommet'
import { Span, Switch } from 'honorable'
import { useCallback, useState } from 'react'

import { PermissionTypes } from '../accounts/types'
import { ListItem } from '../profile/ListItem'
import { GqlError } from '../utils/Alert'
import { Tabs } from '../utils/SidebarTabs'

import { GeneralAttributes } from './Role'

function PermissionToggle({
  permission, description, attributes, setAttributes, first, last,
}) {
  const toggle = useCallback(enable => {
    if (enable) {
      setAttributes({
        ...attributes,
        permissions: [permission, ...attributes.permissions],
      })
    }
    else {
      setAttributes({
        ...attributes,
        permissions: attributes.permissions.filter(perm => perm !== permission),
      })
    }
  },
  [permission, attributes, setAttributes])

  return (
    <ListItem
      first={first}
      last={last}
      background="fill-two"
    >
      <Box fill="horizontal">
        <Span fontWeight={500}>{permission.toLowerCase()}</Span>
        <Span color="text-light">{description}</Span>
      </Box>
      <Switch
        checked={!!attributes.permissions.find(perm => perm === permission)}
        onChange={({ target: { checked } }) => toggle(checked)}
      />
    </ListItem>
  )
}

export function RoleForm({
  // eslint-disable-next-line
  error, attributes, setAttributes, bindings, setBindings, ...box
}) {
  const [view, setView] = useState('General')
  const permissions = Object.entries(PermissionTypes)
  const len = permissions.length

  return (
    <Box
      flex={false}
      gap="small"
      {...box}
    >
      {error && (
        <GqlError
          header="Something went wrong"
          error={error}
        />
      )}
      <Tabs
        tabs={['General', 'Permissions']}
        tab={view}
        setTab={setView}
      />
      {view === 'General' && (
        <GeneralAttributes
          attributes={attributes}
          setAttributes={setAttributes}
          bindings={bindings}
          setBindings={setBindings}
        />
      )}
      {view === 'Permissions' && (
        <Box gap="small">
          <Box>
            <Span fontWeight="bold">Permissions</Span>
            <Span>
              Grant permissions to all users and groups bound to this role
            </Span>
          </Box>
          <Box>
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
          </Box>
        </Box>
      )}
    </Box>
  )
}
