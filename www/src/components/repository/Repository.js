import { useQuery } from '@apollo/client'
import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { Div, Flex } from 'honorable'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { REPO_Q } from '../repos/queries'

import RepositoryHeader from './RepositoryHeader'

function Tab({ to, label, active }) {
  const hoverStyle = {
    '&:hover': {
      color: 'text',
      backgroundColor: 'background-light',
    },
  }

  return (
    <Div
      as={Link}
      to={to}
      px={1}
      py={0.5}
      mb={0.5}
      display="block"
      borderRadius={4}
      fontWeight={600}
      textDecoration="none"
      color={active ? 'text' : 'text-light'}
      backgroundColor={active ? 'background-light' : 'transparent'}
      transition="all 150ms ease"
      {...hoverStyle}
    >
      {label}
    </Div>
  )
}

function Repository() {
  const { id } = useParams()
  const { data } = useQuery(REPO_Q, {
    variables: { repositoryId: id },
    fetchPolicy: 'cache-and-network',
  })
  const { pathname } = useLocation()

  if (!data) {
    return (
      <Div
        pt={12}
        xflex="x5"
      >
        <LoopingLogo />
      </Div>
    )
  }

  const { repository } = data

  return (
    <Div
      pb={4}
      px={4}
    >
      <RepositoryHeader repository={repository} />
      <Flex
        mt={2}
        align="flex-start"
      >
        <Div
          mr={3}
          width={128 + 32}
        >
          <Tab
            label="Description"
            to={`/repository/${id}`}
            active={pathname === `/repository/${id}`}
          />
          <Tab
            label="Bundles"
            to={`/repository/${id}/bundles`}
            active={pathname.startsWith(`/repository/${id}/bundles`)}
          />
          <Tab
            label="Packages"
            to={`/repository/${id}/packages`}
            active={pathname.startsWith(`/repository/${id}/packages`)}
          />
          <Tab
            label="Tests"
            to={`/repository/${id}/tests`}
            active={pathname.startsWith(`/repository/${id}/tests`)}
          />
          <Tab
            label="Deployments"
            to={`/repository/${id}/deployments`}
            active={pathname.startsWith(`/repository/${id}/deployments`)}
          />
        </Div>
        <Outlet />
      </Flex>
    </Div>
  )
}

export default Repository
