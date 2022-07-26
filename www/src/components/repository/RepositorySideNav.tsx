import { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Div, Flex, Img, P,
} from 'honorable'
import { Tab } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'
import { capitalize } from '../../utils/string'

function RepositorySideNav({ ...props }) {
  const repository = useContext(RepositoryContext)
  const { pathname } = useLocation()

  return (
    <Flex
      paddingVertical="medium"
      paddingLeft="medium"
      width={240}
      flexShrink={0}
      direction="column"
      {...props}
    >
      <Flex
        align="center"
        gap="medium"
      >
        <Flex
          align="center"
          justify="center"
          padding="xsmall"
          backgroundColor="fill-one"
          border="1px solid border"
          borderRadius="medium"
        >
          <Img
            src={repository.darkIcon || repository.icon}
            alt={repository.name}
            width={48}
          />
        </Flex>
        <Div>
          <P subtitle1>{capitalize(repository.name)}</P>
        </Div>
      </Flex>
      <P
        body2
        color="text-xlight"
        marginTop="medium"
      >
        Published by {capitalize(repository.publisher.name)}
      </P>
      <Div
        marginTop="medium"
        marginLeft="minus-medium"
      >
        <Link
          to={`/repository/${repository.id}`}
          style={{ textDecoration: 'none' }}
        >
          <Tab
            vertical
            active={pathname === `/repository/${repository.id}`}
            textDecoration="none"
          >
            Readme
          </Tab>
        </Link>
        <Link
          to={`/repository/${repository.id}/packages`}
          style={{ textDecoration: 'none' }}
        >

          <Tab
            vertical
            active={pathname.startsWith(`/repository/${repository.id}/packages`)}
            textDecoration="none"
          >
            Packages
          </Tab>
        </Link>
        {repository.installation && repository.oauthSettings && (
          <Link
            to={`/repository/${repository.id}/oidc`}
            style={{ textDecoration: 'none' }}
          >

            <Tab
              vertical
              active={pathname.startsWith(`/repository/${repository.id}/oidc`)}
              textDecoration="none"
            >
              OpenID Connect
            </Tab>
          </Link>
        )}
        <Link
          to={`/repository/${repository.id}/tests`}
          style={{ textDecoration: 'none' }}
        >

          <Tab
            vertical
            active={pathname.startsWith(`/repository/${repository.id}/tests`)}
            textDecoration="none"
          >
            Tests
          </Tab>
        </Link>
        <Link
          to={`/repository/${repository.id}/deployments`}
          style={{ textDecoration: 'none' }}
        >

          <Tab
            vertical
            active={pathname.startsWith(`/repository/${repository.id}/deployments`)}
            textDecoration="none"
          >
            Deployments
          </Tab>
        </Link>
        {repository?.artifacts?.length > 0 && (
          <Link
            to={`/repository/${repository.id}/artifacts`}
            style={{ textDecoration: 'none' }}
          >
            <Tab
              vertical
              active={pathname.startsWith(`/repository/${repository.id}/artifacts`)}
              textDecoration="none"
            >
              Artifacts
            </Tab>
          </Link>
        )}
        {!!repository.editable && (
          <Link
            to={`/repository/${repository.id}/edit`}
            style={{ textDecoration: 'none' }}
          >
            <Tab
              vertical
              active={pathname.startsWith(`/repository/${repository.id}/edit`)}
              textDecoration="none"
            >
              Edit
            </Tab>
          </Link>
        )}
      </Div>
    </Flex>
  )
}

export default RepositorySideNav
