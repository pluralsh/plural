import { Flex } from 'honorable'
import { Box } from 'grommet'
import {
  PageTitle,
  SubTab,
  TabList,
  TabPanel,
} from 'pluralsh-design-system'
import { useRef, useState } from 'react'

import { Invites } from './Invites'
import { InviteUser } from './InviteUser'
import { UsersList } from './UsersList'

const DIRECTORY = [
  {
    key: 'Users',
    label: 'Users',
  },
  {
    key: 'Invites',
    label: 'Invites',
  },
]

export function Users() {
  const [selectedKey, setSelectedKey] = useState('Users')
  const tabStateRef = useRef()

  return (
    <Flex
      flexGrow={1}
      flexDirection="column"
      maxHeight="100%"
    >
      <PageTitle heading="Users">
        <Flex
          alignItems="flex-end"
          gap="medium"
        >
          <TabList
            stateRef={tabStateRef}
            stateProps={{
              orientation: 'horizontal',
              selectedKey,
              onSelectionChange: setSelectedKey,
            }}
          >
            {DIRECTORY.map(({ label, key }) => (
              <SubTab
                key={key}
                textValue={label}
              >
                {label}
              </SubTab>
            ))}
          </TabList>
          <InviteUser />
        </Flex>
      </PageTitle>
      <TabPanel
        as={(
          <Box
            fill
            gap="medium"
          />
        )}
        stateRef={tabStateRef}
      >
        {selectedKey === 'Users' && <UsersList />}
        {selectedKey === 'Invites' && <Invites />}
      </TabPanel>
    </Flex>
  )
}
