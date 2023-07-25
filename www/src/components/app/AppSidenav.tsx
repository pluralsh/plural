import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Div, Flex, Img, P } from 'honorable'
import {
  TreeNav,
  TreeNavEntry,
  WrapWithIf,
  getBarePathFromPath,
  removeTrailingSlashes,
} from '@pluralsh/design-system'
import capitalize from 'lodash/capitalize'
import isEmpty from 'lodash/isEmpty'
import { useTheme } from 'styled-components'

import { useAppContext } from '../../contexts/AppContext'
import { type Repository } from '../../generated/graphql'

import { type getDocsData } from './App'
import { useDocPageContext } from './docs/AppDocsContext'

export const getDirectory = ({
  app = null,
  docs,
}: {
  app: Repository | Record<string, never> | null
  docs: ReturnType<typeof getDocsData> | null
}) => {
  if (!app) {
    return []
  }

  return [
    {
      label: 'Upgrade channel',
      path: 'upgrade',
      enabled: true,
    },
    {
      label: 'OpenID connect users',
      path: 'oidc',
      enabled: app?.oauthSettings,
    },
    {
      path: 'docs',
      label: `${capitalize(app?.name)} docs`,
      enabled: !isEmpty(docs),
      ...(docs ? { subpaths: docs } : {}),
    },
  ].filter((dir) => dir.enabled)
}

export default function AppSidenav({
  docs,
  ...props
}: {
  docs?: ReturnType<typeof getDocsData>
}) {
  const theme = useTheme()
  const { clusterId, appName } = useParams()
  const app = useAppContext()

  const { pathname } = useLocation()

  const pathPrefix = `/apps/${clusterId}/${appName}`

  const filteredDirectory = useMemo(
    () => getDirectory({ app, docs }),
    [app, docs]
  )

  return (
    <Flex
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
            src={app.darkIcon || app.icon}
            alt={app.name}
            width={48}
          />
        </Flex>
        <Div>
          <P subtitle1>{capitalize(app.name)}</P>
        </Div>
      </Flex>
      <Div
        height="100%"
        overflowY="auto"
        marginTop="medium"
        paddingBottom={theme.spacing.medium}
      >
        <SideNavEntries
          directory={filteredDirectory}
          pathname={pathname}
          pathPrefix={pathPrefix}
        />
      </Div>
    </Flex>
  )
}

function SideNavEntries({
  directory,
  pathname,
  pathPrefix,
  root = true,
}: {
  directory: any[]
  pathname: string
  pathPrefix: string
  root?: boolean
}) {
  const docPageContext = useDocPageContext()

  return (
    <WrapWithIf
      condition={root}
      wrapper={<TreeNav />}
    >
      {directory.map(({ label, path, subpaths, type, ...props }) => {
        const currentPath =
          removeTrailingSlashes(getBarePathFromPath(pathname)) || ''
        const fullPath = `${pathPrefix}/${removeTrailingSlashes(path) || ''}`
        const hashlessPath = fullPath.split('#')[0]
        const isInCurrentPath = currentPath.startsWith(hashlessPath)
        const docPageRootHash = props?.headings?.[0]?.id || ''
        const active =
          type === 'docPage'
            ? isInCurrentPath &&
              (docPageContext.selectedHash === docPageRootHash ||
                !docPageContext.selectedHash)
            : type === 'docPageHash'
            ? isInCurrentPath && docPageContext.selectedHash === props.id
            : isInCurrentPath

        return (
          <TreeNavEntry
            key={fullPath}
            href={path === 'docs' ? undefined : fullPath}
            label={label}
            active={active}
            {...(type === 'docPageHash' && props.id
              ? {
                  onClick: () => {
                    docPageContext.scrollToHash(props.id)
                  },
                }
              : type === 'docPage'
              ? {
                  onClick: () => {
                    docPageContext.scrollToHash(docPageRootHash)
                  },
                }
              : {})}
          >
            {subpaths ? (
              <SideNavEntries
                directory={subpaths}
                pathname={pathname}
                pathPrefix={pathPrefix}
                root={false}
              />
            ) : null}
          </TreeNavEntry>
        )
      })}
    </WrapWithIf>
  )
}
