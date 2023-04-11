import { useSetBreadcrumbs } from '@pluralsh/design-system'

import { useMemo } from 'react'

import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'

import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'

import MarketplaceRepositories from './MarketplaceRepositories'

export const MARKETPLACE_CRUMB = { label: 'marketplace', url: '/marketplace' }

function Marketplace({ installed = false, publisher = null }: any) {
  const breadcrumbs = useMemo(() => [
    MARKETPLACE_CRUMB,
    ...(installed ? [{ label: 'installed', url: '/installed' }] : [])],
  [installed])

  useSetBreadcrumbs(breadcrumbs)

  return (
    <ResponsiveLayoutPage padding={0}>
      {!publisher && <ResponsiveLayoutSpacer />}
      <MarketplaceRepositories
        installed={installed}
        publisher={publisher}
      />
      {!publisher && <ResponsiveLayoutSpacer />}
    </ResponsiveLayoutPage>
  )
}

export default Marketplace
