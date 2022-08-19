import { useQuery } from '@apollo/client'
import { useRef } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { Flex } from 'honorable'
import { TabPanel } from 'pluralsh-design-system'
import styled from 'styled-components'

import { GoBack } from 'components/utils/GoBack'

import RepositoryContext from '../../contexts/RepositoryContext.ts'

import useBreadcrumbs from '../../hooks/useBreadcrumbs'

import { LoopingLogo } from '../utils/AnimatedLogo'

import {
  ResponsiveLayoutContentContainer,
  ResponsiveLayoutSidecarContainer,
  ResponsiveLayoutSidenavContainer,
  ResponsiveLayoutSpacer,
} from '../layout/ResponsiveLayout.tsx'

import RepositorySideNav from './RepositorySideNav.tsx'
import { RepositorySideCar } from './RepositorySideCar.tsx'

import { REPOSITORY_QUERY } from './queries'

const StyledTabPanel = styled(TabPanel)(() => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  height: '100%',
  maxHeight: '100%',
}))

function Repository() {
  const { id } = useParams()
  const { data } = useQuery(REPOSITORY_QUERY, {
    variables: {
      repositoryId: id,
    },
  })
  const tabStateRef = useRef()

  useBreadcrumbs(data && [
    { url: '/marketplace', text: 'Marketplace' },
    { url: `/repository/${data.repository.id}`, text: data.repository.name },
  ])

  if (!data) {
    return (
      <Flex
        // These mp values are to align the looping logo with the previous looping logo.
        // Reload the page on /repository/foo to see it in action.
        paddingTop={24.25 * 16}
        marginLeft={-5 * 16}
        align="center"
        justify="center"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  const { repository } = data

  return (
    <RepositoryContext.Provider value={repository}> {/* Provide the repository to children */}
      <Flex
        height="100%"
        maxHeight="100%"
        direction="column"
        overflowY="hidden"
      >
        <GoBack
          text="Back to marketplace"
          link="/marketplace"
        />
        <Flex
          flexGrow={1}
          height={0}
          overflowX="hidden"
          paddingLeft="medium"
          paddingRight="large"
          paddingTop="medium"
        >
          <ResponsiveLayoutSidenavContainer>
            <RepositorySideNav tabStateRef={tabStateRef} />
          </ResponsiveLayoutSidenavContainer>
          <ResponsiveLayoutSpacer />
          <ResponsiveLayoutContentContainer paddingHorizontal="xxxsmall">
            <StyledTabPanel stateRef={tabStateRef}>
              <Outlet />
            </StyledTabPanel>
          </ResponsiveLayoutContentContainer>
          <ResponsiveLayoutSidecarContainer>
            <RepositorySideCar />
          </ResponsiveLayoutSidecarContainer>
          <ResponsiveLayoutSpacer />
        </Flex>
      </Flex>
    </RepositoryContext.Provider>
  )
}

export default Repository
