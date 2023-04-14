import { MutableRefObject, useImperativeHandle, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  Div,
  Flex,
  Img,
  P,
} from 'honorable'
import { Tab, TabList } from '@pluralsh/design-system'
import capitalize from 'lodash/capitalize'

import { LinkTabWrap } from '../utils/Tabs'
import { SideNavOffset } from '../utils/layout/SideNavOffset'
import { useAppContext } from '../../contexts/AppContext'

const DIRECTORY = [
  { label: 'Upgrade channel', path: '/upgrade' },
  { label: 'OpenID Connect', path: '/oidc' },
  { label: 'Uninstall', path: '/uninstall' },
]

export default function AppSidenav({
  tabStateRef: outerTabStateRef,
  ...props
}: {
  tabStateRef: MutableRefObject<any>
}) {
  const { clusterId, appId } = useParams()
  const app = useAppContext()

  const { pathname } = useLocation()
  const tabStateRef = useRef<any>()

  useImperativeHandle(outerTabStateRef, () => ({ ...(tabStateRef.current || {}) }))
  const pathPrefix = `/apps/${clusterId}/${appId}`
  const filteredDirectory = DIRECTORY.filter(({ path }) => {
    switch (path) {
    case '/oidc':
      return app?.oauthSettings
    default:
      return true
    }
  })

  const currentTab = [...filteredDirectory]
    .sort((a, b) => b.path.length - a.path.length)
    .find(tab => pathname?.startsWith(`${pathPrefix}${tab.path}`))

  return (
    <Flex
      flexShrink={0}
      direction="column"
      {...props}
    >
      <Flex
        align="center"
        gap="medium"
      >
        <Flex
          align="center"
          justify="center"
          padding="xsmall"
          backgroundColor="fill-one"
          border="1px solid border"
          borderRadius="medium"
        >
          <Img
            src={app?.darkIcon || app?.icon}
            alt={app?.name}
            width={48}
          />
        </Flex>
        <Div>
          <P subtitle1>{capitalize(app?.name)}</P>
        </Div>
      </Flex>
      <SideNavOffset
        marginTop="medium"
      >
        <TabList
          stateRef={tabStateRef}
          stateProps={{
            orientation: 'vertical',
            selectedKey: currentTab?.path,
          }}
        >
          {filteredDirectory.map(({ label, path }) => (
            <LinkTabWrap
              key={path}
              textValue={label}
              to={`${pathPrefix}${path}`}
            >
              <Tab>{label}</Tab>
            </LinkTabWrap>
          ))}
        </TabList>
      </SideNavOffset>
    </Flex>
  )
}
