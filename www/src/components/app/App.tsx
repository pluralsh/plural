import { useContext, useMemo, useRef } from 'react'
import { Link, Outlet, useParams } from 'react-router-dom'
import { Button, TabPanel, useSetBreadcrumbs } from '@pluralsh/design-system'
import { Flex, P } from 'honorable'
import { useQuery } from '@apollo/client'

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

export function App() {
  const { clusterId } = useParams()
  const { clusters } = useContext(ClustersContext)
  const cluster = clusters.find(({ id }) => id === clusterId)

  return (
    <ImpersonateServiceAccount
      id={cluster?.owner?.id}
      skip={!cluster?.owner?.serviceAccount}
    >
      <AppInternal />
    </ImpersonateServiceAccount>
  )
}

function AppInternal() {
  const { appName: name, clusterId } = useParams()
  const { clusters } = useContext(ClustersContext)
  const cluster = clusters.find(({ id }) => id === clusterId)
  const { data, loading } = useQuery<{repository: Repository}>(REPO_Q, { variables: { name } })
  const tabStateRef = useRef<any>(null)
  const breadcrumbs = useMemo(() => [
    CLUSTERS_ROOT_CRUMB,
    { label: `${cluster?.name}`, url: `/clusters/${clusterId}` },
    { label: `${name}`, url: `/apps/${clusterId}/${name}` },
  ],
  [cluster?.name, clusterId, name])

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
          <AppSidenav tabStateRef={tabStateRef} />
        </ResponsiveLayoutSidenavContainer>
        <Flex
          grow={1}
          overflowY="auto"
          padding="large"
        >
          <ResponsiveLayoutSpacer />
          <TabPanel
            as={(<ResponsiveLayoutContentContainer overflow="visible" />)}
            stateRef={tabStateRef}
          >
            <Outlet />
          </TabPanel>
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
