import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'

import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'

import MarketplaceRepositories from './MarketplaceRepositories'

function Marketplace({ installed = false, publisher = null }: any) {
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
