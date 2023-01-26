import { useQuery } from '@apollo/client'
import { useRef } from 'react'
import {
  Link,
  Outlet,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Flex, P } from 'honorable'
import { Button, TabPanel } from '@pluralsh/design-system'
import { validate as uuidValidate } from 'uuid'

import { GoBack } from '../utils/GoBack'

import RepositoryContext from '../../contexts/RepositoryContext'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutSidecarContainer } from '../utils/layout/ResponsiveLayoutSidecarContainer'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutSidenavContainer } from '../utils/layout/ResponsiveLayoutSidenavContainer'
import TopBar from '../layout/TopBar'

import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'

import { UnderTopBar } from '../repos/UnderTopBar'

import RepositorySideNav from './RepositorySideNav'
import { RepositorySideCar } from './RepositorySideCar'

import { REPOSITORY_QUERY } from './queries'

function Repository() {
  const { name } = useParams()
  const [searchParams] = useSearchParams()
  const { data, loading } = useQuery(REPOSITORY_QUERY, { variables: uuidValidate(name ?? '') ? { repositoryId: name } : { name } })
  const backStackName = searchParams.get('backStackName')
  const tabStateRef = useRef<any>(null)

  if (loading) {
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

  if (!data || !data.repository) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        height="100%"
      >
        <P body2>Repository not found.</P>
        <Button
          mt="medium"
          as={Link}
          to="/marketplace"
        >
          Go to the marketplace
        </Button>
      </Flex>
    )
  }

  const { repository } = data

  return (
    <RepositoryContext.Provider value={repository}> {/* Provide the repository to children */}
      <ResponsiveLayoutPage flexDirection="column">
        <TopBar>
          <GoBack
            text={backStackName ? `Back to ${backStackName} stack` : 'Back to marketplace'}
            link={backStackName ? `/stack/${backStackName}` : '/marketplace'}
          />
        </TopBar>
        <UnderTopBar>
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
        </UnderTopBar>
      </ResponsiveLayoutPage>
    </RepositoryContext.Provider>
  )
}

export default Repository
