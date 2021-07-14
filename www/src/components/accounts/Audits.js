import React, { useContext, useEffect, useState } from 'react'
import moment from 'moment'
import { Box, Text } from 'grommet'
import { useQuery } from 'react-apollo'
import Avatar from '../users/Avatar'
import { AUDITS_Q } from './queries'
import { extendConnection } from '../../utils/graphql'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { StandardScroller } from '../utils/SmoothScroller'
import { Link } from 'react-router-dom'
import { LoopingLogo } from '../utils/AnimatedLogo'

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

const versionLink = ({chart, terraform}) => chart ? `/charts/${chart.id}` : `/terraform/${terraform.id}`

function resourceInfo({version, group, role, integrationWebhook, repository, image}) {
  if (version) return ({
    link: versionLink(version),
    text: `Version{${version.chart ? version.chart.name : version.terraform.name}:${version.version}}`
  })

  if (group) return {link: '/accounts/edit/groups', text: `Group{${group.name}}`}
  if (role) return {link: '/accounts/edit/roles', text: `Role{${role.name}}`}
  if (integrationWebhook) return {link: `/webhooks/${integrationWebhook.id}`, text: `Webhook{${integrationWebhook.name}}`}
  if (image) {
    return ({
      link: `/dkr/img/${image.id}`,
      text: `Docker{${image.dockerRepository.name}:${image.tag}}`
    })
  }

  if (repository) return {link: `/repositories/${repository.id}`, text: `Repository{${repository.name}}`}

  return {link: null, text: ''}
}

function Resource({audit}) {
  const {link, text} = resourceInfo(audit)
  if (!link) return null

  return <Link to={link}>{text}</Link>
}

function Audit({audit}) {
  return (
    <Box flex={false} direction='row' pad='small' gap='xsmall' border={{side: 'bottom', color: 'light-3'}} 
         align='center' onClick={() => null} hoverIndicator='light-2' focusIndicator={false}>
      <Box width='25%'>
        <Text size='small'>{audit.action}</Text>
      </Box>
      <Box flex={false} width='25%' direction='row' gap='xsmall' align='center'>
        <Avatar user={audit.actor} size='30px' />
        <Text size='small'>{audit.actor.name}</Text>
      </Box>
      <Box width='25%'>
        <Resource audit={audit} />
      </Box>
      <Box width='25%'>
        <Text size='small'>{moment(audit.insertedAt).format('lll')}</Text>
      </Box>
    </Box>
  )
}

export function Audits() {
  const [listRef, setListRef] = useState(null)
  const {data, loading, fetchMore} = useQuery(AUDITS_Q, {fetchPolicy: 'cache-and-network'})
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {    
    setBreadcrumbs([ {text: 'audits', url: '/audits'} ])
  }, [setBreadcrumbs])

  if (!data) return <LoopingLogo />

  const {edges, pageInfo} = data.audits

  return (
    <Box fill>
      <AuditHeader />
      <Box fill>
        <StandardScroller
          listRef={listRef}
          setListRef={setListRef}
          hasNextPage={pageInfo.hasNextPage}
          items={edges}
          loading={loading} 
          mapper={({node}) => <Audit key={node.id} audit={node} />} 
          loadNextPage={() => pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult: {audits}}) => extendConnection(prev, audits, 'audits')
          })} />
      </Box>
    </Box>
  )
}