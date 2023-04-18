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
import { MARKETPLACE_CRUMB } from '../marketplace/Marketplace'
import ClustersContext from '../../contexts/ClustersContext'
import ImpersonateServiceAccount from '../utils/ImpersonateServiceAccount'
import { AppContextProvider } from '../../contexts/AppContext'
import { Repository } from '../../generated/graphql'

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
  const { appId: name, ...restParams } = useParams()
  const subPath = restParams?.['*']?.split?.('/')[0]
  const { data, loading } = useQuery<{repository: Repository}>(REPO_Q, { variables: { name } })
  const tabStateRef = useRef<any>(null)
  const breadcrumbs = useMemo(() => [
    MARKETPLACE_CRUMB,
    {
      label: `${name}-${subPath || 'readme'}` ?? '',
      url: `/repository/${name}`,
    },
  ],
  [subPath, name])

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
      <ResponsiveLayoutPage>
        <ResponsiveLayoutSidenavContainer>
          <AppSidenav tabStateRef={tabStateRef} />
        </ResponsiveLayoutSidenavContainer>
        <ResponsiveLayoutSpacer />
        <TabPanel
          as={<ResponsiveLayoutContentContainer overflow="visible" />}
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
      </ResponsiveLayoutPage>
    </AppContextProvider>
  )
}
