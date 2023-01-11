import { Div } from 'honorable'

import BillingPreview from './BillingPreview'
import BillingPricingCards from './BillingPricingCards'
import BillingPricingTable from './BillingPricingTable'

function BillingManagePlan() {
  return (
    <>
      <BillingPreview />
      <Div marginTop="xxlarge">
        <BillingPricingCards />
      </Div>
      <Div marginTop="xxlarge">
        <BillingPricingTable />
      </Div>
    </>
  )
}

export default BillingManagePlan
