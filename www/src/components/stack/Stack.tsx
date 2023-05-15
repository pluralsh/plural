import { useQuery } from '@apollo/client'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { Div, Flex, P, Span } from 'honorable'
import {
  StackIcon,
  Tab,
  TabList,
  TabPanel,
  VerifiedIcon,
  useSetBreadcrumbs,
} from '@pluralsh/design-system'
import { useMemo, useRef } from 'react'

import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutSidecarContainer } from '../utils/layout/ResponsiveLayoutSidecarContainer'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutSidenavContainer } from '../utils/layout/ResponsiveLayoutSidenavContainer'
import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'
import { SideNavOffset } from '../utils/layout/SideNavOffset'

import { LinkTabWrap } from '../utils/Tabs'

import { ProvidersSidecar } from '../utils/recipeHelpers'

import { StackCollection } from '../../generated/graphql'

import LoadingIndicator from '../utils/LoadingIndicator'

import { MARKETPLACE_CRUMB } from '../marketplace/Marketplace'

import { STACK_QUERY } from './queries'
import { StackContext } from './types'

const DIRECTORY = [{ label: 'Stack applications', path: '' }]

function Sidenav({ stack }: StackContext) {
  const { pathname } = useLocation()
  const pathPrefix = `/stack/${stack.name}`
  const currentTab = DIRECTORY.sort(
    (a, b) => b.path.length - a.path.length
  ).find((tab) => pathname?.startsWith(`${pathPrefix}${tab.path}`))
  const tabStateRef = useRef<any>(null)

  return (
    <Flex
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
      <SideNavOffset marginTop="medium">
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
      </SideNavOffset>
    </Flex>
  )
}

function StackSidecar({ stack }: StackContext) {
  const filteredCollections = stack?.collections?.filter(
    (sC: StackCollection | null | undefined): sC is StackCollection => !!sC
  )
  const recipes = filteredCollections?.map(({ provider }) => ({
    description: `Installs ${stack.displayName || stack.name} on ${provider}`,
    provider,
  }))

  return (
    <Flex
      flexDirection="column"
      gap="large"
      position="relative"
    >
      {/* <StackActions
        stack={stack}
        recipes={recipes}
      /> */}
      <ProvidersSidecar
        recipes={recipes}
        type="stack"
        name={stack.name}
      />
    </Flex>
  )
}

export default function Stack() {
  const { name } = useParams()
  const { data } = useQuery(STACK_QUERY, {
    variables: { name, provider: 'AWS' },
  })
  const tabStateRef = useRef<any>(null)
  const breadcrumbs = useMemo(
    () => [MARKETPLACE_CRUMB, { label: `${name} stack` }],
    [name]
  )

  useSetBreadcrumbs(breadcrumbs)

  if (!data) return <LoadingIndicator />

  const { stack } = data
  const outletContext: StackContext = { stack }

  return (
    <ResponsiveLayoutPage>
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
        <StackSidecar stack={stack} />
      </ResponsiveLayoutSidecarContainer>
      <ResponsiveLayoutSpacer />
    </ResponsiveLayoutPage>
  )
}
