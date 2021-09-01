import { Box, Text } from 'grommet'
import moment from 'moment'
import React, { useState } from 'react'
import { useQuery } from 'react-apollo'
import { useParams } from 'react-router'
import { extendConnection } from '../../utils/graphql'
import { SectionContentContainer } from '../Explore'
import { HeaderItem } from '../repos/Docker'
import { Provider } from '../repos/misc'
import Avatar from '../users/Avatar'
import { StandardScroller } from '../utils/SmoothScroller'
import { Placeholder } from './Audits'
import { TableRow } from './Domains'
import { DNS_RECORDS } from './queries'

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

function DnsRecord({record}) {
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
      <HeaderItem text={moment(record.insertedAt).format('lll')} width='20%' nobold />
    </TableRow>
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

  const {pageInfo, edges} = data.dnsRecords

  return (
    <SectionContentContainer header='Dns Records'>
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
            mapper={({node}) => <DnsRecord key={node.id} record={node} />} 
            loadNextPage={() => pageInfo.hasNextPage && fetchMore({
              variables: {cursor: pageInfo.endCursor},
              updateQuery: (prev, {fetchMoreResult: {dnsRecords}}) => extendConnection(prev, dnsRecords, 'dnsRecords')
            })} />
        </Box>
      </Box>
    </SectionContentContainer>
  )
}