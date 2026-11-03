import {
  Card,
  Flex,
  Tab,
  TabList,
  TabPanel,
  type TabListStateProps,
} from '@pluralsh/design-system'
import { ReactNode, Suspense, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import LoadingIndicator from '../LoadingIndicator'
import { PageHeader } from '../ProductEmptyState'
import { LinkTabWrap } from '../Tabs'

import { ResponsiveLayoutContentContainer } from './ResponsiveLayoutContentContainer'
import { ResponsiveLayoutPage } from './ResponsiveLayoutPage'
import { ResponsiveLayoutSidenavContainer } from './ResponsiveLayoutSidenavContainer'
import { SideNavOffset } from './SideNavOffset'

export type SubpageNavItem = { path: string; label: string }

const NARROW_CONTENT_WIDTH = 720
const NAV_OFFSET_WITHOUT_TILE = 66

export function SubpageLayout({
  tile,
  directory,
  narrow = false,
  children = <Outlet />,
}: {
  tile?: ReactNode
  directory: SubpageNavItem[]
  narrow?: boolean
  children?: ReactNode
}) {
  const { pathname } = useLocation()
  const tabStateRef = useRef<any>(null)
  const currentTab = [...directory]
    .sort((a, b) => b.path.length - a.path.length)
    .find(({ path }) => pathname?.startsWith(path))
  const stateProps: TabListStateProps = {
    orientation: 'vertical',
    selectedKey: currentTab?.path,
  }

  return (
    <ResponsiveLayoutPage padding={0}>
      <ResponsiveLayoutSidenavContainer
        marginLeft="large"
        marginTop="large"
      >
        <SideNavOffset paddingTop={tile ? 0 : NAV_OFFSET_WITHOUT_TILE}>
          {tile && <SubpageTileSC>{tile}</SubpageTileSC>}
          <TabList
            stateRef={tabStateRef}
            stateProps={stateProps}
          >
            {directory.map(({ label, path }) => (
              <LinkTabWrap
                vertical
                key={path}
                textValue={label}
                to={path}
              >
                <Tab>{label}</Tab>
              </LinkTabWrap>
            ))}
          </TabList>
        </SideNavOffset>
      </ResponsiveLayoutSidenavContainer>
      <Flex
        grow={1}
        overflowY="auto"
        padding="large"
      >
        <TabPanel
          as={
            <ResponsiveLayoutContentContainer
              overflow="visible"
              {...(narrow && { maxWidth: NARROW_CONTENT_WIDTH })}
            />
          }
          stateRef={tabStateRef}
        >
          <Suspense fallback={<LoadingIndicator />}>{children}</Suspense>
        </TabPanel>
      </Flex>
    </ResponsiveLayoutPage>
  )
}

export function SubpageHeader({
  title,
  children,
}: {
  title: ReactNode
  children?: ReactNode
}) {
  return (
    <SubpageHeaderSC>
      <PageHeader title={title}>{children}</PageHeader>
    </SubpageHeaderSC>
  )
}

export const SubpageCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.medium,
  padding: theme.spacing.large,
}))

const SubpageTileSC = styled.div(({ theme }) => ({
  marginBottom: theme.spacing.xlarge,
}))

const SubpageHeaderSC = styled.div(({ theme }) => ({
  flexShrink: 0,
  paddingBottom: theme.spacing.large,
  marginBottom: theme.spacing.large,
  borderBottom: theme.borders.default,
  '& > div': { minHeight: 40 },
}))
