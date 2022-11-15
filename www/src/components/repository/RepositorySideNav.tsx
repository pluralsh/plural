import {
  MutableRefObject,
  useContext,
  useImperativeHandle,
  useRef,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  A,
  Div,
  Flex,
  Img,
  P,
} from 'honorable'
import { Tab, TabList } from '@pluralsh/design-system'
import capitalize from 'lodash/capitalize'

import RepositoryContext from '../../contexts/RepositoryContext'
import { LinkTabWrap } from '../utils/Tabs'

const DIRECTORY = [
  { label: 'Readme', path: '' },
  { label: 'Packages', path: '/packages' },
  { label: 'OpenID Connect', path: '/oidc' },
  { label: 'Tests', path: '/tests' },
  { label: 'Deployments', path: '/deployments' },
  { label: 'Artifacts', path: '/artifacts' },
  { label: 'Edit', path: '/edit' },
]

function RepositorySideNav({
  tabStateRef: outerTabStateRef,
  ...props
}: {
  tabStateRef: MutableRefObject<any>
}) {
  const repository = useContext(RepositoryContext)

  const { pathname } = useLocation()
  const tabStateRef = useRef<any>()

  useImperativeHandle(outerTabStateRef, () => ({ ...(tabStateRef.current || {}) }))
  const pathPrefix = `/repository/${repository.id}`
  const filteredDirectory = DIRECTORY.filter(({ path }) => {
    switch (path) {
    case '/oidc':
      return repository.installation && repository.oauthSettings
      break
    case '/artifacts':
      return repository.artifacts.length > 0
      break
    case '/edit':
      return !!repository.editable
      break
    default:
      return true
    }
  })

  const currentTab = [...filteredDirectory]
    .sort((a, b) => b.path.length - a.path.length)
    .find(tab => pathname?.startsWith(`${pathPrefix}${tab.path}`))

  return (
    <Flex
      paddingVertical="medium"
      paddingLeft="medium"
      width={240}
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
            src={repository.darkIcon || repository.icon}
            alt={repository.name}
            width={48}
          />
        </Flex>
        <Div>
          <P subtitle1>{capitalize(repository.name)}</P>
        </Div>
      </Flex>
      <P
        body2
        color="text-xlight"
        marginTop="medium"
      >
        Published by&nbsp;
        <A
          inline
          as={Link}
          to={`/publisher/${repository.publisher.id}?backRepositoryName=${repository.name}&backRepositoryId=${repository.id}`}
        >
          {capitalize(repository.publisher.name)}
        </A>
      </P>
      <Div
        marginTop="medium"
        marginLeft="minus-medium"
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
      </Div>
    </Flex>
  )
}

export default RepositorySideNav
