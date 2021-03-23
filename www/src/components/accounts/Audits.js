import React, { useContext, useEffect } from 'react'
import moment from 'moment'
import { Box, Text } from 'grommet'
import { Loading, Scroller } from 'forge-core'
import { useQuery } from 'react-apollo'
import Avatar from '../users/Avatar'
import { AUDITS_Q } from './queries'
import { extendConnection } from '../../utils/graphql'
import { BreadcrumbsContext } from '../Breadcrumbs'

const HeaderItem = ({text, width, nobold}) => (<Box width={width}><Text size='small' weight={nobold ? null : 500}>{text}</Text></Box>)

function AuditHeader() {
  return (
    <Box flex={false} direction='row' pad='small' gap='xsmall' border={{side: 'bottom', color: 'light-5'}} align='center'>
      <HeaderItem text='Action' width='25%' />
      <HeaderItem text='Actor' width='25%' />
      <HeaderItem text='Resource' width='25%' />
      <HeaderItem text='Event Time' width='25%' />
    </Box>
  )
}

function resourceName({version, group, role, integrationWebhook, repository}) {
  if (version) return `Version{${version.chart ? version.chart.name : version.terraform.name}:${version.version}}`
  if (group) return `Group{${group.name}}`
  if (role) return `Role{${role.name}}`
  if (integrationWebhook) return `Webhook{${integrationWebhook.name}}`
  return `Repository{${repository.name}}`
}

function Audit({audit}) {
  return (
    <Box flex={false} direction='row' pad='small' gap='xsmall' border={{side: 'bottom', color: 'light-3'}} 
         align='center' onClick={() => null} hoverIndicator='light-2' focusIndicator={false}>
      <Box width='25%'>
        <Text size='small'>{audit.action}</Text>
      </Box>
      <Box flex={false} width='25%' direction='row' gap='xsmall' align='center'>
        <Avatar user={audit.actor} />
        <Text size='small'>{audit.actor.name}</Text>
      </Box>
      <Box width='25%'>
        <Text size='small'>{resourceName(audit)}</Text>
      </Box>
      <Box width='25%'>
        <Text size='small'>{moment(audit.insertedAt).format('lll')}</Text>
      </Box>
    </Box>
  )
}

export function Audits() {
  const {data, fetchMore} = useQuery(AUDITS_Q, {fetchPolicy: 'cache-and-network'})
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {    
    setBreadcrumbs([ {text: 'audits', url: '/audits'} ])
  }, [setBreadcrumbs])

  if (!data) return <Loading />

  const {edges, pageInfo} = data.audits

  return (
    <Box fill>
      <AuditHeader />
      <Scroller
        id='builds'
        style={{height: '100%', overflow: 'auto'}}
        edges={edges}
        mapper={({node}) => <Audit key={node.id} audit={node} />}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult}) => extendConnection(prev, fetchMoreResult, 'audits')
        })} />
    </Box>
  )
}