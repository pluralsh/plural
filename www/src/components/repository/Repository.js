import { useContext, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { Div, Flex } from 'honorable'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { BreadcrumbsContext } from '../Breadcrumbs'

import RepositoryHeader from './RepositoryHeader'

import { REPOSITORY_QUERY } from './queries'

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
  const { data } = useQuery(REPOSITORY_QUERY, {
    variables: {
      repositoryId: id,
    },
  })
  const { pathname } = useLocation()
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)

  useEffect(() => {
    if (!data) return

    setBreadcrumbs([
      { url: '/explore', text: 'Explore' },
      { url: `/repositories/${data.repository.id}`, text: data.repository.name },
    ])
  }, [setBreadcrumbs, data])

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
    <Flex
      height="100%"
      maxHeight="100%"
      direction="column"
    >
      <RepositoryHeader
        repository={repository}
        flexShrink={0}
      />
      <Flex
        flexGrow={1}
      >
        <Div
          px={2}
          pt={1}
          width={128 + 64 + 32 - 16}
          flexShrink={0}
          borderRight="1px  solid border"
        >
          <Tab
            label="Description"
            to={`/repository/${id}`}
            active={pathname === `/repository/${id}`}
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
        <Div
          flexGrow={1}
          pt={1.5}
          px={2}
        >
          <Outlet />
        </Div>
      </Flex>
    </Flex>
  )
}

export default Repository
