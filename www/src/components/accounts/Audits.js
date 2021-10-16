import React, { useContext, useEffect, useState } from 'react'
import moment from 'moment'
import { Box, Text } from 'grommet'
import { useParams } from 'react-router'
import { ListView, GraphView } from 'forge-core'
import { useQuery } from 'react-apollo'
import Avatar from '../users/Avatar'
import { AUDITS_Q, AUDIT_METRICS } from './queries'
import { extendConnection } from '../../utils/graphql'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { StandardScroller } from '../utils/SmoothScroller'
import { Link } from 'react-router-dom'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { formatLocation } from '../../utils/geo'
import { Chloropleth } from '../utils/Chloropleth'
import lookup from 'country-code-lookup'
import { SectionContentContainer } from '../Explore'
import { SubmenuItem, SubmenuPortal } from '../navigation/Submenu'

const HeaderItem = ({text, width, nobold}) => (<Box width={width}><Text size='small' weight={nobold ? null : 500}>{text}</Text></Box>)

function AuditHeader() {
  return (
    <Box flex={false} direction='row' pad='small' gap='xsmall' border={{side: 'bottom'}} align='center'>
      <HeaderItem text='Action' width='25%' />
      <HeaderItem text='Actor' width='25%' />
      <HeaderItem text='Resource' width='15%' />
      <HeaderItem text='Event Time' width='15%' />
      <HeaderItem text='IP' width='10%' />
      <HeaderItem text='Location' width='10%' />
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

export function Placeholder() {
  return (
    <Box flex={false} height='50px' pad='small' />
  )
}

function Audit({audit}) {
  return (
    <Box flex={false} direction='row' pad='small' gap='xsmall' border={{side: 'bottom'}} 
         align='center' onClick={() => null} hoverIndicator='hover' focusIndicator={false}>
      <HeaderItem text={audit.action} nobold width='25%' />
      <Box flex={false} width='25%' direction='row' gap='xsmall' align='center'>
        {audit.actor && <Avatar user={audit.actor} size='30px' />}
        {audit.actor && <Text size='small'>{audit.actor.name}</Text>}
      </Box>
      <Box width='15%'>
        <Resource audit={audit} />
      </Box>
      <HeaderItem text={moment(audit.insertedAt).format('lll')} nobold width='15%' />
      <HeaderItem text={audit.ip} nobold width='10%' />
      <HeaderItem text={formatLocation(audit.country, audit.city)} nobold width='10%' />
    </Box>
  )
}

function AuditChloro() {
  const {data} = useQuery(AUDIT_METRICS, {fetchPolicy: 'cache-and-network'})

  if (!data) return null

  const metrics = data.auditMetrics.map(({country, count}) => ({
    id: lookup.byIso(country).iso3, value: count
  }))

  return (
    <SectionContentContainer header='Geodistribution'>
      <Box fill>
        <Chloropleth data={metrics} />
      </Box>
    </SectionContentContainer>
  )
}

export function Audits() {
  const {graph} = useParams()
  const [listRef, setListRef] = useState(null)
  const {data, loading, fetchMore} = useQuery(AUDITS_Q, {fetchPolicy: 'cache-and-network'})
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {    
    setBreadcrumbs([ {text: 'audits', url: '/audits'} ])
  }, [setBreadcrumbs])

  if (!data) return <LoopingLogo dark darkbg />

  const {edges, pageInfo} = data.audits

  return (
    <Box fill direction='row' background='backgroundColor'>
      <SubmenuPortal name='audits'>
        <SubmenuItem
          icon={<ListView size='14px' />}
          label='List View'
          selected={graph === 'table'}
          url='/audits/table' />
        <SubmenuItem
          icon={<GraphView size='14px' />}
          label='Graph View'
          selected={graph === 'graph'}
          url='/audits/graph' />
      </SubmenuPortal>
      {graph === 'graph' && <AuditChloro />}
      {graph === 'table' && (
        <Box fill>
          <AuditHeader />
          <Box fill>
            <StandardScroller
              listRef={listRef}
              setListRef={setListRef}
              hasNextPage={pageInfo.hasNextPage}
              items={edges}
              loading={loading} 
              placeholder={Placeholder}
              mapper={({node}) => <Audit key={node.id} audit={node} />} 
              loadNextPage={() => pageInfo.hasNextPage && fetchMore({
                variables: {cursor: pageInfo.endCursor},
                updateQuery: (prev, {fetchMoreResult: {audits}}) => extendConnection(prev, audits, 'audits')
              })} />
          </Box>
        </Box>
      )}
    </Box>
  )
}