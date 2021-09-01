import { Box, Text } from 'grommet'
import moment from 'moment'
import React, { useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { SecondaryButton } from 'forge-core'
import { useHistory, useParams } from 'react-router'
import { deepUpdate, extendConnection, removeConnection, updateCache } from '../../utils/graphql'
import { SectionContentContainer, SectionPortal } from '../Explore'
import { HeaderItem } from '../repos/Docker'
import { Provider } from '../repos/misc'
import Avatar from '../users/Avatar'
import { StandardScroller } from '../utils/SmoothScroller'
import { Placeholder } from './Audits'
import { TableRow } from './Domains'
import { DELETE_DNS_RECORD, DNS_RECORDS } from './queries'
import { Return, Trash } from 'grommet-icons'
import { Icon } from './Group'

function DnsRecordHeader() {
  return (
    <TableRow>
      <HeaderItem text='Name' width='25%' />
      <HeaderItem text='Type' width='10%' />
      <HeaderItem text='Cluster' width='20%' />
      <HeaderItem text='Creator' width='25%' />
      <HeaderItem text='Created On' width='20%' />
    </TableRow>
  )
}

function DnsRecord({record, domain}) {
  return (
    <TableRow>
      <HeaderItem text={record.name} width='25%' />
      <HeaderItem text={record.type.toUpperCase()} width='10%' />
      <Box width='20%' direction='row' align='center' gap='xsmall'>
        <Provider provider={record.provider} width='25px' />
        <Text size='small' weight={500}>{record.cluster}</Text>
      </Box>
      <Box width='25%' direction='row' align='center' gap='xsmall'>
        <Avatar user={record.creator} size='30px' />
        <Text size='small'>{record.creator.name}</Text>
      </Box>
      <Box width='20%' direction='row' align='center'>
        <Box fill='horizontal'>
          <Text size='small'>{moment(record.insertedAt).format('lll')}</Text>
        </Box>
        <DeleteRecord record={record} domain={domain} />
      </Box>
    </TableRow>
  )
}

function DeleteRecord({record, domain}) {
  const [mutation] = useMutation(DELETE_DNS_RECORD, {
    variables: {name: record.name, type: record.type},
    update: (cache, {data: {deleteDnsRecord}}) => updateCache(cache, {
      query: DNS_RECORDS,
      variables: {id: domain.id},
      update: (prev) => deepUpdate(
        prev, 
        'dnsDomain', 
        (domain) => removeConnection(domain, deleteDnsRecord, 'dnsRecords')
      )
    })
  })

  return (
    <Icon
      icon={Trash} 
      tooltip='delete' 
      onClick={mutation} 
      iconAttrs={{color: 'error'}} />
  )
}

function RecordsControls() {
  let history = useHistory()

  return (
    <SectionPortal>
      <SecondaryButton 
        icon={<Return size='small' />}
        label='Return' 
        onClick={() => history.push('/accounts/edit/domains')} />
    </SectionPortal>
  )
}

export function DnsRecords() {
  const [listRef, setListRef] = useState(null)
  const {id} = useParams()
  const {data, loading, fetchMore} = useQuery(DNS_RECORDS, {
    variables: {id},
    fetchPolicy: 'cache-and-network'
  })

  if (!data) return null

  const {dnsRecords: {pageInfo, edges}, ...domain} = data.dnsDomain

  return (
    <SectionContentContainer header={`${domain.name} dns entries`}>
      <Box fill>
        <DnsRecordHeader />
        <Box fill>
          <StandardScroller
            listRef={listRef}
            setListRef={setListRef}
            hasNextPage={pageInfo.hasNextPage}
            items={edges}
            loading={loading} 
            placeholder={Placeholder}
            mapper={({node}) => <DnsRecord key={node.id} record={node} domain={domain} />} 
            loadNextPage={() => pageInfo.hasNextPage && fetchMore({
              variables: {cursor: pageInfo.endCursor},
              updateQuery: (prev, {fetchMoreResult: {dnsDomain}}) => deepUpdate(
                prev, 
                'dnsDomain', 
                (prev) => extendConnection(prev, dnsDomain.dnsRecords, 'dnsRecords')
              )
            })} />
        </Box>
      </Box>
      <RecordsControls />
    </SectionContentContainer>
  )
}