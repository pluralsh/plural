import { PageCard, Tab, TabList } from 'pluralsh-design-system'
import { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { Div } from 'honorable'

import { LinkTabWrap } from '../utils/Tabs'

import CurrentUserContext from '../../contexts/CurrentUserContext'

const DIRECTORY = [
  { path: '/account/edit', label: 'Account attributes' },
  { path: '/account/users', label: 'Users' },
  { path: '/account/service-accounts', label: 'Service accounts' },
  { path: '/account/groups', label: 'Groups' },
  { path: '/account/roles', label: 'Roles' },
  { path: '/account/domains', label: 'Domains' },
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
    <>
      <PageCard
        marginBottom="large"
        heading={(
          <Div
            display="-webkit-box"
            webkitLineClamp={2}
            webkitBoxOrient="vertical"
            overflowY="hidden"
            lineBreak="all"
          >{me?.account?.name || ''}
          </Div>
        )}
        subheading={me?.publisher ? 'Publisher' : undefined}
        icon={{ name: me?.account?.name || '?' }}
      />
      <AccountTabList tabStateRef={tabStateRef} />
    </>
  )
}
