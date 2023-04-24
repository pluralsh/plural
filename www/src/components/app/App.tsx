import { useContext, useMemo } from 'react'
import { Link, Outlet, useParams } from 'react-router-dom'
import { Button, useSetBreadcrumbs } from '@pluralsh/design-system'
import { Flex, P } from 'honorable'
import { useQuery } from '@apollo/client'
import { collectHeadings, getMdContent } from '@pluralsh/design-system/dist/markdoc'

import { config } from '../../markdoc/mdSchema'
import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutSidecarContainer } from '../utils/layout/ResponsiveLayoutSidecarContainer'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutSidenavContainer } from '../utils/layout/ResponsiveLayoutSidenavContainer'
import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'
import LoadingIndicator from '../utils/LoadingIndicator'
import ClustersContext from '../../contexts/ClustersContext'
import ImpersonateServiceAccount from '../utils/ImpersonateServiceAccount'
import { AppContextProvider } from '../../contexts/AppContext'
import { Repository } from '../../generated/graphql'
import { CLUSTERS_ROOT_CRUMB } from '../overview/Overview'

import { AppSidecar } from './AppSidecar'
import AppSidenav from './AppSidenav'
import { REPO_Q } from './queries'
import { DocPageContextProvider } from './docs/AppDocsContext'

type DocDataAtom = {
  path: string
  id: string
  label: string
}

type DocDataPageHash = DocDataAtom & {
  type: 'docPageHash'
}

type DocDataPage = DocDataAtom & {
  type: 'docPage'
  subpaths: (DocDataPageHash)[]
  content: ReturnType<typeof getMdContent>,
  headings: ReturnType<typeof collectHeadings>,
}

type DocData = DocDataPage[]

export function getDocsData(docs: Repository['docs']):DocData | undefined {
  return docs?.map((doc, i) => {
    const content = getMdContent(doc?.content, config)
    const headings = collectHeadings(content)
    const id = headings?.[0]?.id || `page-${i}`
    const label = headings?.[0]?.title || `Page ${i}`
    const path = `docs/${id}`

    const subpaths = headings
      .map((heading):DocDataPageHash | null => {
        if (heading.level === 3 && heading.id && heading.title) {
          return {
            path: `${path}#${heading.id}`,
            label: `${heading.title}`,
            id: heading.id,
            type: 'docPageHash',
          }
        }

        return null
      })
      .filter((heading:DocDataPageHash | null):heading is DocDataPageHash => !!heading)

    return {
      path,
      id,
      label,
      subpaths,
      content,
      headings,
      type: 'docPage',
    }
  })
}

export function App() {
  const { clusterId } = useParams()
  const { clusters } = useContext(ClustersContext)
  const cluster = clusters.find(({ id }) => id === clusterId)

  return (
    <ImpersonateServiceAccount
      id={cluster?.owner?.id}
      skip={!cluster?.owner?.serviceAccount}
    >
      <DocPageContextProvider>
        <AppInternal />
      </DocPageContextProvider>
    </ImpersonateServiceAccount>
  )
}

function AppInternal() {
  const { appName: name, clusterId } = useParams()
  const { clusters } = useContext(ClustersContext)
  const cluster = clusters.find(({ id }) => id === clusterId)
  const { data, loading } = useQuery<{repository: Repository}>(REPO_Q, { variables: { name } })
  const breadcrumbs = useMemo(() => [
    CLUSTERS_ROOT_CRUMB,
    { label: `${cluster?.name}`, url: `/clusters/${clusterId}` },
    { label: `${name}`, url: `/apps/${clusterId}/${name}` },
  ],
  [cluster?.name, clusterId, name])

  const docs = useMemo(() => getDocsData(data?.repository?.docs),
    [data?.repository?.docs])

  console.log('docs', data?.repository?.docs)
  console.log('docsData', docs)

  useSetBreadcrumbs(breadcrumbs)

  if (!data && loading) return <LoadingIndicator />

  if (!data?.repository) {
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

  return (
    <AppContextProvider value={data.repository}>
      <ResponsiveLayoutPage padding={0}>
        <ResponsiveLayoutSidenavContainer
          marginLeft="large"
          marginTop="large"
        >
          <AppSidenav
            docs={docs}
          />
        </ResponsiveLayoutSidenavContainer>
        <Flex
          grow={1}
          overflowY="auto"
          padding="large"
        >
          <ResponsiveLayoutSpacer />
          <ResponsiveLayoutContentContainer
            role="main"
            overflow="visible"
          >
            <Outlet context={{ docs }} />
          </ResponsiveLayoutContentContainer>
          <ResponsiveLayoutSidecarContainer
            display-desktop-down={undefined}
            display-desktopSmall-down="none"
          >
            <AppSidecar />
          </ResponsiveLayoutSidecarContainer>
          <ResponsiveLayoutSpacer />
        </Flex>
      </ResponsiveLayoutPage>
    </AppContextProvider>
  )
}
