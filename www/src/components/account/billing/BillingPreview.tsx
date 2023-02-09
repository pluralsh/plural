import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Div, Flex, Switch } from 'honorable'
import {
  Card,
  CloseIcon,
  ClusterIcon,
  PeopleIcon,
} from '@pluralsh/design-system'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'

import BillingConsumptionContext from '../../../contexts/BillingConsumptionContext'
import SubscriptionContext from '../../../contexts/SubscriptionContext'
import { pluralize } from '../../../utils/string'

type BillingPreviewPropsType = {
  noCard?: boolean
  discountPreview?: boolean
  yearly?: boolean
  onChange?: (isProfessional: boolean) => void
}

type LinePropsType = {
  count: number
  price: number
  yearly: boolean
  name: string
  top?: string | null
}

function getPrice({ lineItems } : any, dimension: string): number {
  return (lineItems.find(x => x?.dimension === dimension)?.cost || 0) / 100
}

function PriceLine({
  count, price, yearly, name, top,
} : LinePropsType) {
  return (
    <Flex
      align="center"
      gap="medium"
      marginTop={top}
    >
      {name === 'cluster' ? <ClusterIcon /> : <PeopleIcon />}
      <Div>
        {count} {pluralize(name, count)}
      </Div>
      <CloseIcon size={12} />
      <Div>
        ${price}
      </Div>
      <Div
        borderBottom="1px solid border"
        flexGrow={1}
      />
      <Div>
        ${price * count}/{yearly ? 'year' : 'month'}
      </Div>
    </Flex>
  )
}

function BillingPreview({
  noCard, discountPreview, yearly, onChange,
}: BillingPreviewPropsType) {
  const { proPlatformPlan, proYearlyPlatformPlan, annualDiscount } = useContext(PlatformPlansContext)
  const { isProPlan, isEnterprisePlan, account } = useContext(SubscriptionContext)
  const { nClusters, nUsers } = useContext(BillingConsumptionContext)

  const [isProfessional, setIsProfessional] = useState(isProPlan)

  const currCluster = useMemo(() => (account?.subscription?.plan ? getPrice(account.subscription?.plan, 'CLUSTER') : 0), [account])
  const currUser = useMemo(() => (account?.subscription?.plan ? getPrice(account.subscription?.plan, 'USER') : 0), [account])
  const pClusters = useMemo(() => (yearly ? getPrice(proYearlyPlatformPlan, 'CLUSTER') : getPrice(proPlatformPlan, 'CLUSTER')), [yearly, proYearlyPlatformPlan, proPlatformPlan])
  const pUsers = useMemo(() => (yearly ? getPrice(proYearlyPlatformPlan, 'USER') : getPrice(proPlatformPlan, 'USER')), [yearly, proYearlyPlatformPlan, proPlatformPlan])
  const clusterPrice = ((discountPreview || isProfessional) ? pClusters : currCluster)
  const userPrice = ((discountPreview || isProfessional) ? pUsers : currUser)
  const totalClusters = nClusters * clusterPrice
  const totalUsers = nUsers * userPrice

  const handleChange = useCallback((event: any) => {
    setIsProfessional(event.target.checked)
    onChange?.(event.target.checked)
  }, [onChange])

  const wrapCard = useCallback((children: ReactNode) => (
    <Card
      padding="large"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {children}
    </Card>
  ), [])

  const renderProfessionalSwitch = useCallback(() => (
    <Switch
      checked={isProfessional}
      onChange={handleChange}
      padding={0}
    >
      <Div
        color="text-xlight"
        marginLeft="xxsmall"
      >
        Preview Professional plan
      </Div>
    </Switch>
  ), [isProfessional, handleChange])

  const renderAnnualDiscountSwitch = useCallback(() => (
    <Flex
      align="center"
      gap="small"
    >
      <Div
        body2
        color="text-xlight"
      >
        Monthly
      </Div>
      <Switch
        checked={isProfessional}
        onChange={handleChange}
        padding={0}
      >
        <Div
          body2
          color="text-xlight"
          marginLeft="xxsmall"
        >
          Annually ({annualDiscount * 100}% discount)
        </Div>
      </Switch>
    </Flex>
  ), [isProfessional, annualDiscount, handleChange])

  const renderContent = useCallback(() => (
    <Div width="100%">
      <Flex
        align="center"
        justify="space-between"

      >
        <Div
          body1
          fontWeight={600}
        >
          Your usage
        </Div>
        {discountPreview ? renderAnnualDiscountSwitch() : (!isProPlan && !isEnterprisePlan) ? renderProfessionalSwitch() : null}
      </Flex>
      <Div
        marginTop="large"
        gap="small"
      >
        <PriceLine
          count={nClusters}
          price={clusterPrice}
          yearly={!!yearly}
          name="cluster"
        />
        <PriceLine
          count={nUsers}
          price={userPrice}
          yearly={!!yearly}
          name="user"
          top="small"
        />
      </Div>
      <Flex
        marginTop="large"
        justify="flex-end"
        fontWeight={600}
        body1
      >
        Total: ${totalClusters + totalUsers}/{yearly ? 'year' : 'month'}
      </Flex>
    </Div>
  ), [
    yearly,
    discountPreview,
    nClusters,
    nUsers,
    totalClusters,
    totalUsers,
    clusterPrice,
    isEnterprisePlan,
    isProPlan,
    userPrice,
    renderProfessionalSwitch,
    renderAnnualDiscountSwitch,
  ])

  useEffect(() => {
    if (!isProPlan) return

    setIsProfessional(true)
  }, [isProPlan])

  return noCard ? renderContent() : wrapCard(renderContent())
}

export default BillingPreview
