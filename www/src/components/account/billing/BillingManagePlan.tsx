import { Div } from 'honorable'

import BillingPricingCards from './BillingPricingCards'
import BillingPricingTable from './BillingPricingTable'

function BillingManagePlan() {
  return (
    <>
      <BillingPricingCards />
      <Div marginTop="xxlarge">
        <BillingPricingTable />
      </Div>
    </>
  )
}

export default BillingManagePlan
