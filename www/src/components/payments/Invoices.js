import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Anchor, Box, Table, TableBody, TableCell, TableHeader, TableRow, Text } from 'grommet'
import { useQuery } from '@apollo/client'

import moment from 'moment'

import { TagContainer } from '../repos/Tags'
import { TOOLBAR_SIZE } from '../Toolbar'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { LoopingLogo } from '../utils/AnimatedLogo'

import { subscriptionCost } from './utils'
import { SUBSCRIPTIONS_Q, SUBSCRIPTION_Q } from './queries'

const ICON_SIZE = '30px'

function Subscription({ current, subscription, setCurrent }) {
  const { installation: { repository }, plan } = subscription
  const totalCost = subscriptionCost(subscription, plan)

  return (
    <TagContainer
      gap="small"
      pad="small"
      enabled={current.id === subscription.id}
      onClick={() => setCurrent(subscription)}
    >
      <Box
        direction="row"
        align="center"
        gap="small"
        width="100%"
      >
        <Box width={ICON_SIZE}>
          <img
            alt=""
            src={repository.icon}
            width={ICON_SIZE}
            height={ICON_SIZE}
          />
        </Box>
        <Box>
          <Text size="small">{repository.name}</Text>
          <Text size="small">{plan.name} plan</Text>
        </Box>
      </Box>
      <Box>
        <Text
          color="green"
          size="small"
        >${totalCost / 100}
        </Text>
      </Box>
    </TagContainer>
  )
}

function Invoice({ invoice: { number, hostedInvoiceUrl, amountPaid, createdAt, currency } }) {
  return (
    <TableRow>
      <TableCell>{moment(createdAt).format('LLL')}</TableCell>
      <TableCell>{number}</TableCell>
      <TableCell>
        <Text
          size="small"
          color="green"
        >
          {amountPaid / 100} {currency}
        </Text>
      </TableCell>
      <TableCell><Anchor href={hostedInvoiceUrl}>invoice</Anchor></TableCell>
    </TableRow>
  )
}

function SubscriptionBar({ edges, current, setCurrent }) {
  return edges.map(({ node }) => (
    <Subscription
      key={node.id}
      current={current}
      subscription={node}
      setCurrent={setCurrent}
    />
  ))
}

function InvoicesInner({ current: { id } }) {
  const navigate = useNavigate()
  const { loading, data } = useQuery(SUBSCRIPTION_Q, { variables: { id } })
  if (!data) return null
  if (loading) return <LoopingLogo />

  const { invoices: { edges }, installation: { repository } } = data.repositorySubscription

  return (
    <Box gap="small">
      <Box
        direction="row"
        gap="xsmall"
      >
        <Text
          size="small"
          weight={500}
        >Invoices for
        </Text>
        <Anchor onClick={() => navigate(`/repositories/${repository.id}`)}>
          <Text
            size="small"
            weight={500}
          >{repository.name}
          </Text>
        </Anchor>
      </Box>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell
              scope="col"
              border="bottom"
            >date
            </TableCell>
            <TableCell
              scope="col"
              border="bottom"
            >number
            </TableCell>
            <TableCell
              scope="col"
              border="bottom"
            >amount
            </TableCell>
            <TableCell
              scope="col"
              border="bottom"
            >link
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {edges.map(({ node }) => (
            <Invoice
              key={node.id}
              invoice={node}
            />
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

function EmptyState() {
  return (
    <Box
      width="100%"
      height="100%"
      align="center"
      justify="center"
      pad="medium"
    >
      <Text>You haven't signed up for any repositories yet</Text>
    </Box>
  )
}

export default function Invoices() {
  const [current, setCurrent] = useState(null)
  const { loading, data } = useQuery(SUBSCRIPTIONS_Q)
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([])
  }, [setBreadcrumbs])

  if (loading && !data) return null
  const { edges } = data.subscriptions

  if (edges.length === 0) return <EmptyState />

  const currentSubscription = current || edges[0].node

  return (
    <Box
      direction="row"
      width="100%"
      height={`calc(100vh - ${TOOLBAR_SIZE}px)`}
    >
      <Box
        flex={false}
        width="250px"
        style={{ height: '100%', scroll: 'auto' }}
        border={{ side: 'right', color: 'border' }}
      >
        <SubscriptionBar
          edges={edges}
          current={currentSubscription}
          setCurrent={setCurrent}
        />
      </Box>
      <Box
        fill
        pad="medium"
      >
        <InvoicesInner current={currentSubscription} />
      </Box>
    </Box>
  )
}
