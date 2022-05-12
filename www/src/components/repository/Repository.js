import { useQuery } from '@apollo/client'
import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { Div, Flex, P } from 'honorable'

import { Divider } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

import useBreadcrumbs from '../../hooks/useBreadcrumbs'

import { LoopingLogo } from '../utils/AnimatedLogo'

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
  const { pathname } = useLocation()
  const { data } = useQuery(REPOSITORY_QUERY, {
    variables: {
      repositoryId: id,
    },
  })

  useBreadcrumbs(data && [
    { url: '/explore', text: 'Explore' },
    { url: `/repository/${data.repository.id}`, text: data.repository.name },
  ])

  if (!data) {
    return (
      <Flex
        pt={12}
        align="center"
        justify="center"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  const { repository } = data

  console.log('repository', repository)

  return (
    <RepositoryContext.Provider value={repository}> {/* Provide the repository to children */}
      <Flex
        height="100%"
        maxHeight="100%"
        direction="column"
        overflowY="hidden"
      >
        <RepositoryHeader flexShrink={0} />
        <Flex
          flexGrow={1}
          height={0}
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
            {repository?.artifacts?.length > 0 && (
              <Tab
                label="Artifacts"
                to={`/repository/${id}/artifacts`}
                active={pathname.startsWith(`/repository/${id}/artifacts`)}
              />
            )}
            {!!repository.editable && (
              <>
                <Divider
                  mb={0.5}
                  text="Admin"
                />
                <Tab
                  label="Edit"
                  to={`/repository/${id}/edit`}
                  active={pathname.startsWith(`/repository/${id}/edit`)}
                />
              </>
            )}
          </Div>
          <Div
            flexGrow={1}
            pt={1.5}
            px={2}
            height="100%"
            maxHeight="100%"
            overflowY="auto"
          >
            <Outlet />
          </Div>
        </Flex>
      </Flex>
    </RepositoryContext.Provider>
  )
}

export default Repository
