import { Div } from 'honorable'
import { useContext } from 'react'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

import BillingPreview from './BillingPreview'
import BillingPricingCards from './BillingPricingCards'
import BillingPricingTable from './BillingPricingTable'
import ConfirmPayment from './ConfirmPayment'

function BillingManagePlan() {
  const { isEnterprisePlan } = useContext(SubscriptionContext)

  return (
    <>
      <ConfirmPayment />
      {!isEnterprisePlan && <BillingPreview />}
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
