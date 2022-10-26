import { useQuery } from '@apollo/client'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import {
  Div,
  Flex,
  P,
  Span,
} from 'honorable'

import {
  StackIcon,
  Tab,
  TabList,
  TabPanel,
  VerifiedIcon,
} from 'pluralsh-design-system'

import { useRef } from 'react'

import { GoBack } from '../utils/GoBack'

import {
  ResponsiveLayoutContentContainer,
  ResponsiveLayoutSidecarContainer,
  ResponsiveLayoutSidenavContainer,
  ResponsiveLayoutSpacer,
} from '../layout/ResponsiveLayout'

import { LinkTabWrap } from '../utils/Tabs'

import { LoopingLogo } from '../utils/AnimatedLogo'

import TopBar from '../layout/TopBar'

import { STACK_QUERY } from './queries'
import { StackContext } from './types'
import { StackActions } from './misc'

const DIRECTORY = [
  { label: 'Stack applications', path: '' },
]

function Sidenav({ stack }: StackContext) {
  const { pathname } = useLocation()
  const pathPrefix = `/stack/${stack.name}`
  const currentTab = DIRECTORY
    .sort((a, b) => b.path.length - a.path.length)
    .find(tab => pathname?.startsWith(`${pathPrefix}${tab.path}`))
  const tabStateRef = useRef<any>(null)<any>()

  return (
    <Flex
      paddingVertical="medium"
      paddingLeft="medium"
      width={240}
      flexShrink={0}
      direction="column"
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
          height={64}
          width={64}
        >
          <StackIcon
            color="text-primary-accent"
            size={32}
          />
        </Flex>
        <Div>
          <P subtitle1>{stack.displayName || stack.name}</P>
          <Flex
            direction="row"
            alignItems="center"
          >
            <VerifiedIcon
              size={12}
              color="text-primary-accent"
            />
            <Span
              caption
              color="text-xlight"
              marginLeft="xxsmall"
            >
              Verified
            </Span>
          </Flex>
        </Div>
      </Flex>
      <P
        body2
        color="text-xlight"
        marginTop="medium"
      >
        Curated by Plural
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
          {DIRECTORY.map(({ label, path }) => (
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

function Sidecar({ stack }: StackContext) {
  return (
    <Div
      position="relative"
      width={200}
      paddingTop="medium"
    >
      <StackActions stack={stack} />
    </Div>
  )
}

export default function Stack() {
  const { name } = useParams()
  const { data } = useQuery(STACK_QUERY, { variables: { name, provider: 'AWS' } })
  const tabStateRef = useRef<any>(null)

  if (!data) {
    return (
      <Flex
        paddingTop={388}
        marginLeft={-80}
        align="center"
        justify="center"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  const { stack } = data
  const outletContext: StackContext = { stack }

  return (
    <Flex
      height="100%"
      maxHeight="100%"
      direction="column"
      overflowY="hidden"
    >
      <TopBar>
        <GoBack
          text="Back to marketplace"
          link="/marketplace"
        />
      </TopBar>
      <Flex
        flexGrow={1}
        height={0}
        overflowX="hidden"
        paddingLeft="medium"
        paddingRight="medium"
      >
        <ResponsiveLayoutSidenavContainer>
          <Sidenav stack={stack} />
        </ResponsiveLayoutSidenavContainer>
        <ResponsiveLayoutSpacer />
        <TabPanel
          as={<ResponsiveLayoutContentContainer />}
          stateRef={tabStateRef}
        >
          <Outlet context={outletContext} />
        </TabPanel>
        <ResponsiveLayoutSidecarContainer>
          <Sidecar stack={stack} />
        </ResponsiveLayoutSidecarContainer>
        <ResponsiveLayoutSpacer />
      </Flex>
    </Flex>
  )
}
