import {
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import {
  Div,
  Flex,
  Spinner,
  Switch,
} from 'honorable'
import {
  Card,
  CloseIcon,
  ClusterIcon,
  PeopleIcon,
} from '@pluralsh/design-system'

import { useQuery } from '@apollo/client'

import CurrentUserContext from '../../../contexts/CurrentUserContext'

import { ANNUAL_PRICING_DISCOUNT, CLUSTER_PRICING, USER_PRICING } from './constants'

import { USERS_QUERY } from './queries'

type BillingPreviewPropsType = {
  noCard?: boolean
  discountPreview?: boolean
}

function BillingPreview({ noCard, discountPreview }: BillingPreviewPropsType) {
  const { me } = useContext(CurrentUserContext)
  const [isProfessional, setIsProfessional] = useState(false)
  const { data: usersData, loading: usersLoading } = useQuery(USERS_QUERY)

  const nClusters = useMemo(() => me?.account?.clusterCount ?? 0, [me])
  const nUsers = useMemo(() => usersData?.users?.edges?.length ?? 0, [usersData])
  const pClusters = useMemo(() => (discountPreview
    ? isProfessional
      ? Math.ceil(CLUSTER_PRICING * (1 - ANNUAL_PRICING_DISCOUNT))
      : CLUSTER_PRICING
    : isProfessional
      ? CLUSTER_PRICING
      : 0),
  [discountPreview, isProfessional])
  const pUsers = useMemo(() => (discountPreview
    ? isProfessional
      ? Math.ceil(USER_PRICING * (1 - ANNUAL_PRICING_DISCOUNT))
      : USER_PRICING
    : isProfessional
      ? USER_PRICING
      : 0),
  [discountPreview, isProfessional])
  const totalClusters = useMemo(() => (discountPreview && isProfessional ? 12 : 1) * nClusters * pClusters,
    [
      discountPreview,
      isProfessional,
      nClusters,
      pClusters,
    ])
  const totalUsers = useMemo(() => (discountPreview && isProfessional ? 12 : 1) * nUsers * pUsers,
    [
      discountPreview,
      isProfessional,
      nUsers,
      pUsers,
    ])

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

  const renderLoading = useCallback(() => (
    <Spinner />
  ), [])

  const renderProfessionalSwitch = useCallback(() => (
    <Switch
      checked={isProfessional}
      onChange={event => setIsProfessional(event.target.checked)}
      padding={0}
    >
      <Div
        color="text-xlight"
        marginLeft="xxsmall"
      >
        Preview Professional plan
      </Div>
    </Switch>
  ), [isProfessional])

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
        onChange={event => setIsProfessional(event.target.checked)}
        padding={0}
      >
        <Div
          body2
          color="text-xlight"
          marginLeft="xxsmall"
        >
          Annually ({ANNUAL_PRICING_DISCOUNT * 100}% discount)
        </Div>
      </Switch>
    </Flex>
  ), [isProfessional])

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
        {discountPreview ? renderAnnualDiscountSwitch() : renderProfessionalSwitch()}
      </Flex>
      <Div marginTop="large">
        <Flex
          align="center"
          gap="medium"
        >
          <ClusterIcon />
          <Div>
            {nClusters} cluster{nClusters > 1 ? 's' : ''}
          </Div>
          <CloseIcon size={12} />
          <Div>
            ${pClusters}/month
          </Div>
          {discountPreview && isProfessional && (
            <>
              <CloseIcon size={12} />
              <Div>
                12 months
              </Div>
            </>
          )}
          <Div
            borderBottom="1px solid border"
            flexGrow={1}
          />
          <Div>
            ${totalClusters}/{discountPreview && isProfessional ? 'year' : 'month'}
          </Div>
        </Flex>
        <Flex
          align="center"
          gap="medium"
          marginTop="small"
        >
          <PeopleIcon />
          <Div>
            {nUsers} user{nUsers > 1 ? 's' : ''}
          </Div>
          <CloseIcon size={12} />
          <Div>
            ${pUsers}/month
          </Div>
          {discountPreview && isProfessional && (
            <>
              <CloseIcon size={12} />
              <Div>
                12 months
              </Div>
            </>
          )}
          <Div
            borderBottom="1px solid border"
            flexGrow={1}
          />
          <Div>
            ${totalUsers}/{discountPreview && isProfessional ? 'year' : 'month'}
          </Div>
        </Flex>
      </Div>
      <Flex
        marginTop="large"
        justify="flex-end"
        fontWeight={600}
        body1
      >
        Total: ${totalClusters + totalUsers}/{discountPreview && isProfessional ? 'year' : 'month'}
      </Flex>
    </Div>
  ), [
    discountPreview,
    isProfessional,
    nClusters,
    nUsers,
    pClusters,
    pUsers,
    totalClusters,
    totalUsers,
    renderProfessionalSwitch,
    renderAnnualDiscountSwitch,
  ])

  if (usersLoading) {
    return noCard ? renderLoading() : wrapCard(renderLoading())
  }

  return noCard ? renderContent() : wrapCard(renderContent())
}

export default BillingPreview
