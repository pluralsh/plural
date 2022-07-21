import { useQuery } from '@apollo/client'
import { Link, Outlet, useParams } from 'react-router-dom'
import { Button, Div, Flex } from 'honorable'
import { ArrowLeftIcon } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext.ts'

import useBreadcrumbs from '../../hooks/useBreadcrumbs'

import { LoopingLogo } from '../utils/AnimatedLogo'

import RepositorySideNav from './RepositorySideNav.tsx'
import RepositorySideCar from './RepositorySideCar.tsx'

import { REPOSITORY_QUERY } from './queries'

function Repository() {
  const { id } = useParams()
  const { data } = useQuery(REPOSITORY_QUERY, {
    variables: {
      repositoryId: id,
    },
  })

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
        <Flex
          paddingVertical="xsmall"
          marginLeft="xlarge"
          marginRight="xlarge"
          borderBottom="1px solid border"
        >
          <Button
            tertiary
            as={Link}
            to="/marketplace"
            startIcon={(
              <ArrowLeftIcon />
            )}
          >
            Back to Marketplace
          </Button>
        </Flex>
        <Flex
          flexGrow={1}
          height={0}
          overflowX="hidden"
          paddingLeft="medium"
          paddingRight="large"
        >
          <RepositorySideNav
            marginRight="xlarge"
          />
          <Div
            flexGrow={1}
            display-desktopLarge-down="none"
          />
          <Flex
            direction="column"
            flexGrow={1}
            flexShrink={1}
            maxWidth-desktop-up={896}
            minWidth-desktopLarge={832}
            minWidth-desktopLarge-up={832}
            minWidth-desktopLarge-down={672}
            height="100%"
            maxHeight="100%"
            paddingBottom="xlarge"
            overflowY="auto"
          >
            <Outlet />
          </Flex>
          <RepositorySideCar
            marginLeft="xlarge"
            marginRight="large"
            display-desktop-down="none"
          />
          <Div
            flexGrow={1}
            display-desktopLarge-down="none"
          />
        </Flex>
      </Flex>
    </RepositoryContext.Provider>
  )
}

export default Repository
