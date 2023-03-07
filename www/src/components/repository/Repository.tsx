import { useRef } from 'react'
import { Link, Outlet, useParams } from 'react-router-dom'
import { Flex, P } from 'honorable'
import { Button, TabPanel } from '@pluralsh/design-system'
import { validate as uuidValidate } from 'uuid'

import { RepositoryContextProvider } from '../../contexts/RepositoryContext'

import { LoopingLogo } from '../utils/AnimatedLogo'
import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutSidecarContainer } from '../utils/layout/ResponsiveLayoutSidecarContainer'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutSidenavContainer } from '../utils/layout/ResponsiveLayoutSidenavContainer'
import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'

import { useRepositoryQuery } from '../../generated/graphql'

import RepositorySideNav from './RepositorySideNav'
import { RepositorySideCar } from './RepositorySideCar'

function Repository() {
  const { name } = useParams()
  const { data, loading } = useRepositoryQuery({
    variables: uuidValidate(name ?? '') ? { id: name } : { name },
  })
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
    <RepositoryContextProvider value={repository}>
      {/* Provide the repository to children */}
      <ResponsiveLayoutPage>
        <ResponsiveLayoutSidenavContainer>
          <RepositorySideNav tabStateRef={tabStateRef} />
        </ResponsiveLayoutSidenavContainer>
        <ResponsiveLayoutSpacer />
        <TabPanel
          as={<ResponsiveLayoutContentContainer overflow="visible" />}
          stateRef={tabStateRef}
        >
          <Outlet />
        </TabPanel>
        <ResponsiveLayoutSidecarContainer>
          <RepositorySideCar />
        </ResponsiveLayoutSidecarContainer>
        <ResponsiveLayoutSpacer />
      </ResponsiveLayoutPage>
    </RepositoryContextProvider>
  )
}

export default Repository
