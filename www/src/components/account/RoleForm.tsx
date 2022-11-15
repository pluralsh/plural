import { Box } from 'grommet'
import { Span, Switch } from 'honorable'
import { Tab, TabList, TabPanel } from '@pluralsh/design-system'
import { useCallback, useRef, useState } from 'react'

import { ListItem } from '../profile/ListItem'
import { GqlError } from '../utils/Alert'

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

const TABS = {
  General: { label: 'General' },
  Permissions: { label: 'Permissions' },
}

export function RoleForm({
  // eslint-disable-next-line
  error,
  attributes,
  setAttributes,
  bindings,
  setBindings,
  ...box
}): any {
  const [view, setView] = useState('General')
  const permissions = Object.entries(PermissionTypes)
  const len = permissions.length
  const tabStateRef = useRef<any>(null)

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
      <TabList
        stateRef={tabStateRef}
        stateProps={{
          orientation: 'horizontal',
          selectedKey: view,
          onSelectionChange: key => setView(key),
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
      </TabPanel>
    </Box>
  )
}
