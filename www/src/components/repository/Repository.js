import { useQuery } from '@apollo/client'
import { useRef } from 'react'
import { Outlet, useParams, useSearchParams } from 'react-router-dom'
import { Flex } from 'honorable'
import { TabPanel } from 'pluralsh-design-system'

import { GoBack } from 'components/utils/GoBack'

import RepositoryContext from '../../contexts/RepositoryContext.ts'

import { LoopingLogo } from '../utils/AnimatedLogo'

import {
  ResponsiveLayoutContentContainer,
  ResponsiveLayoutSidecarContainer,
  ResponsiveLayoutSidenavContainer,
  ResponsiveLayoutSpacer,
} from '../layout/ResponsiveLayout.tsx'
import TopBar from '../layout/TopBar'

import RepositorySideNav from './RepositorySideNav.tsx'
import { RepositorySideCar } from './RepositorySideCar.tsx'

import { REPOSITORY_QUERY } from './queries'

function Repository() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { data } = useQuery(REPOSITORY_QUERY, { variables: { repositoryId: id } })
  const backStackName = searchParams.get('backStackName')
  const tabStateRef = useRef()

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
        <TopBar>
          <GoBack
            text={backStackName ? `Back to ${backStackName} stack` : 'Back to marketplace'}
            link={backStackName ? `/stack/${backStackName}` : '/marketplace'}
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
            <RepositorySideNav tabStateRef={tabStateRef} />
          </ResponsiveLayoutSidenavContainer>
          <ResponsiveLayoutSpacer />
          <TabPanel
            as={
              <ResponsiveLayoutContentContainer overflow="visible" />
            }
            stateRef={tabStateRef}
          >
            <Outlet />
          </TabPanel>
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
