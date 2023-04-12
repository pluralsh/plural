import { useSetBreadcrumbs } from '@pluralsh/design-system'

import { useMemo } from 'react'

import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'

import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'

import MarketplaceRepositories from './MarketplaceRepositories'

export const MARKETPLACE_CRUMB = { label: 'marketplace', url: '/marketplace' }

function Marketplace({ publisher = null }: any) {
  const breadcrumbs = useMemo(() => (publisher
    ? [{ label: 'publisher' }, { label: publisher.name, url: `/publisher/${publisher.id}` }]
    : [MARKETPLACE_CRUMB]),
  [publisher])

  useSetBreadcrumbs(breadcrumbs)

  return (
    <MarketplaceRepositories publisher={publisher} />
  )
}

export default Marketplace
