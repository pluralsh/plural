import { PageCard, Tab, TabList } from '@pluralsh/design-system'
import { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { Div } from 'honorable'

import { LinkTabWrap } from '../utils/Tabs'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import { SideNavOffset } from '../utils/layout/SideNavOffset'

const DIRECTORY = [
  { path: '/account/edit', label: 'Account attributes' },
  { path: '/account/users', label: 'Users' },
  { path: '/account/service-accounts', label: 'Service accounts' },
  { path: '/account/groups', label: 'Groups' },
  { path: '/account/roles', label: 'Roles' },
  { path: '/account/domains', label: 'Domains' },
  { path: '/account/billing', label: 'Billing' },
]

function AccountTabList({ tabStateRef }: any) {
  const { pathname } = useLocation()
  const currentTab = DIRECTORY.find(tab => pathname?.startsWith(tab.path))

  return (
    <TabList
      stateRef={tabStateRef}
      stateProps={{
        orientation: 'vertical',
        selectedKey: currentTab?.path,
      }}
    >
      {DIRECTORY.map(({ label, path }) => (
        <LinkTabWrap
          key={path}
          textValue={label}
          to={path}
        >
          <Tab>{label}</Tab>
        </LinkTabWrap>
      ))}
    </TabList>
  )
}

export default function AccountSideNav({ tabStateRef = {} }: any) {
  const { me } = useContext(CurrentUserContext) as Record<string, any>

  return (
    <SideNavOffset>
      <PageCard
        marginBottom="large"
        heading={(
          <Div wordBreak="break-word">
            {me?.account?.name || ''}
          </Div>
        )}
        subheading={me?.publisher ? 'Publisher' : undefined}
        icon={{ name: me?.account?.name || '?' }}
      />
      <AccountTabList tabStateRef={tabStateRef} />
    </SideNavOffset>
  )
}
