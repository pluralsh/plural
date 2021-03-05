import React, { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, Text, Anchor, Table, TableRow, TableCell, TableBody, TableHeader } from 'grommet'
import { Loading } from 'forge-core'
import { useQuery } from 'react-apollo'
import { SUBSCRIPTIONS_Q, SUBSCRIPTION_Q } from './queries'
import { subscriptionCost } from './utils'
import { TagContainer } from '../repos/Tags'
import moment from 'moment'
import { TOOLBAR_SIZE } from '../Forge'
import { BreadcrumbsContext } from '../Breadcrumbs'

const ICON_SIZE = '30px'

function Subscription({current, subscription, setCurrent}) {
  const {installation: {repository}, plan} = subscription
  const totalCost = subscriptionCost(subscription, plan)
  return (
    <TagContainer
      gap='small'
      pad='small'
      enabled={current.id === subscription.id}
      onClick={() => setCurrent(subscription)}>
      <Box direction='row' align='center' gap='small' width='100%'>
        <Box width={ICON_SIZE}>
          <img alt='' src={repository.icon} width={ICON_SIZE} height={ICON_SIZE} />
        </Box>
        <Box>
          <Text size='small'>{repository.name}</Text>
          <Text size='small'>{plan.name} plan</Text>
        </Box>
      </Box>
      <Box>
        <Text color='green' size='small'>${totalCost / 100}</Text>
      </Box>
    </TagContainer>
  )
}

function Invoice({invoice: {number, hostedInvoiceUrl, amountPaid, createdAt, currency}}) {
  return (
    <TableRow>
      <TableCell>{moment(createdAt).format('LLL')}</TableCell>
      <TableCell>{number}</TableCell>
      <TableCell><Text size='small' color='green'>{amountPaid / 100} {currency}</Text></TableCell>
      <TableCell><Anchor href={hostedInvoiceUrl}>invoice</Anchor></TableCell>
    </TableRow>
  )
}

function SubscriptionBar({edges, current, setCurrent}) {
  return edges.map(({node}) => (
    <Subscription key={node.id} current={current} subscription={node} setCurrent={setCurrent} />
  ))
}

function InvoicesInner({current: {id}}) {
  let history = useHistory()
  const {loading, data} = useQuery(SUBSCRIPTION_Q, {variables: {id}})
  if (!data) return null
  if (loading) return <Loading />

  const {invoices: {edges}, installation: {repository}} = data.repositorySubscription
  return (
    <Box gap='small'>
      <Box direction='row' gap='xsmall'>
        <Text size='small' weight={500}>Invoices for</Text>
        <Anchor onClick={() => history.push(`/repositories/${repository.id}`)}>
          <Text size='small' weight={500}>{repository.name}</Text>
        </Anchor>
      </Box>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell scope='col' border='bottom'>date</TableCell>
            <TableCell scope='col' border='bottom'>number</TableCell>
            <TableCell scope='col' border='bottom'>amount</TableCell>
            <TableCell scope='col' border='bottom'>link</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
         {edges.map(({node}) => <Invoice key={node.id} invoice={node} />)}
        </TableBody>
      </Table>
    </Box>
  )
}

function EmptyState() {
  return (
    <Box width='100%' height='100%' align='center' justify='center' pad='medium'>
      <Text>You haven't signed up for any repositories yet</Text>
    </Box>
  )
}

export default function Invoices() {
  const [current, setCurrent] = useState(null)
  const {loading, data} = useQuery(SUBSCRIPTIONS_Q)
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([])
  }, [])

  if (loading && !data) return null
  const {edges} = data.subscriptions

  if (edges.length === 0) return <EmptyState />

  let currentSubscription = current || edges[0].node

  return (
    <Box direction='row' width='100%' height={`calc(100vh - ${TOOLBAR_SIZE})`}>
      <Box flex={false} width='250px'  style={{height: '100%', scroll: 'auto'}} border={{side: 'right', color: 'light-3'}}>
        <SubscriptionBar
          edges={edges}
          current={currentSubscription}
          setCurrent={setCurrent} />
      </Box>
      <Box fill pad='medium'>
        <InvoicesInner current={currentSubscription} />
      </Box>
    </Box>
  )
}