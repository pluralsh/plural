import { useQuery } from '@apollo/client'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { Div, Flex, P } from 'honorable'

import { GoBack } from 'components/utils/GoBack'

import {
  ResponsiveLayoutContentContainer, ResponsiveLayoutSidecarContainer, ResponsiveLayoutSidenavContainer, ResponsiveLayoutSpacer,
} from 'components/layout/ResponsiveLayout'

import {
  StackIcon, Tab, TabList, TabPanel,
} from 'pluralsh-design-system'

import { useRef } from 'react'

import { LinkTabWrap } from 'components/utils/Tabs'

import { LoopingLogo } from '../utils/AnimatedLogo'

import TopBar from '../layout/TopBar'

import { STACK_QUERY } from './queries'
import { StackContext } from './types'

const DIRECTORY = [
  { label: 'Stack applications', path: '' },
]

function Sidenav({ stack }: any) {
  const { pathname } = useLocation()
  const pathPrefix = `/stack/${stack.name}`
  const currentTab = DIRECTORY
    .sort((a, b) => b.path.length - a.path.length)
    .find(tab => pathname?.startsWith(`${pathPrefix}${tab.path}`))
  const tabStateRef = useRef<any>()

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
        <Div><P subtitle1>{stack.name}</P></Div>
      </Flex>
      <P
        body2
        color="text-xlight"
        marginTop="medium"
      >
        Created by&nbsp;{stack.creator.name}
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

export default function Stack() {
  const { name } = useParams()
  const { data } = useQuery(STACK_QUERY, { variables: { name, provider: 'AWS' } })
  const tabStateRef = useRef()

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
          <Sidenav
            stack={stack}
            tabStateRef={tabStateRef}
          />
        </ResponsiveLayoutSidenavContainer>
        <ResponsiveLayoutSpacer />
        <TabPanel
          as={<ResponsiveLayoutContentContainer />}
          stateRef={tabStateRef}
        >
          <Outlet context={{ stack } as StackContext} />
        </TabPanel>
        <ResponsiveLayoutSidecarContainer>
          {/* TODO: <RepositorySideCar /> */}
        </ResponsiveLayoutSidecarContainer>
        <ResponsiveLayoutSpacer />
      </Flex>
    </Flex>
  )
}
