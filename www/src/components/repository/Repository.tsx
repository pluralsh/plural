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

import {
  ResponsiveLayoutContentContainer,
  ResponsiveLayoutSidecarContainer,
  ResponsiveLayoutSidenavContainer,
  ResponsiveLayoutSpacer,
} from '../layout/ResponsiveLayout'
import TopBar from '../layout/TopBar'

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
