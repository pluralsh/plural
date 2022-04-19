import { Box, Text } from 'grommet'
import moment from 'moment'
import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { SecondaryButton, Trash } from 'forge-core'
import { useNavigate, useParams } from 'react-router-dom'

import { Refresh, Return } from 'grommet-icons'

import { deepUpdate, extendConnection, removeConnection, updateCache } from '../../utils/graphql'
import { SectionContentContainer, SectionPortal } from '../Explore'
import { HeaderItem } from '../repos/Docker'
import { Provider } from '../repos/misc'
import Avatar from '../users/Avatar'
import { StandardScroller } from '../utils/SmoothScroller'

import { Confirm } from '../utils/Confirm'

import { Placeholder } from './Audits'
import { TableRow } from './Domains'
import { DELETE_DNS_RECORD, DNS_RECORDS } from './queries'
import { Icon } from './Group'

function DnsRecordHeader() {
  return (
    <TableRow>
      <HeaderItem
        text="Name"
        width="30%"
      />
      <HeaderItem
        text="Type"
        width="10%"
      />
      <HeaderItem
        text="Cluster"
        width="15%"
      />
      <HeaderItem
        text="Creator"
        width="15%"
      />
      <HeaderItem
        text="Created On"
        width="30%"
      />
    </TableRow>
  )
}

function DnsRecord({ record, domain }) {
  return (
    <TableRow>
      <HeaderItem
        text={record.name}
        width="30%"
      />
      <HeaderItem
        text={record.type.toUpperCase()}
        width="10%"
      />
      <Box
        width="15%"
        direction="row"
        align="center"
        gap="xsmall"
      >
        <Provider
          provider={record.provider}
          width="25px"
        />
        <Text
          size="small"
          weight={500}
        >{record.cluster}
        </Text>
      </Box>
      <Box
        width="15%"
        direction="row"
        align="center"
        gap="xsmall"
      >
        <Avatar
          user={record.creator}
          size="30px"
        />
        <Text size="small">{record.creator.name}</Text>
      </Box>
      <Box
        width="30%"
        direction="row"
        align="center"
      >
        <Box fill="horizontal">
          <Text size="small">{moment(record.insertedAt).format('lll')}</Text>
        </Box>
        <DeleteRecord
          record={record}
          domain={domain}
        />
      </Box>
    </TableRow>
  )
}

function DeleteRecord({ record, domain }) {
  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading, error }] = useMutation(DELETE_DNS_RECORD, {
    variables: { name: record.name, type: record.type },
    update: (cache, { data: { deleteDnsRecord } }) => updateCache(cache, {
      query: DNS_RECORDS,
      variables: { id: domain.id },
      update: prev => deepUpdate(
        prev,
        'dnsDomain',
        domain => removeConnection(domain, deleteDnsRecord, 'dnsRecords')
      ),
    }),
  })

  return (
    <>
      <Icon
        icon={Trash}
        tooltip="delete"
        onClick={() => setConfirm(true)}
        iconAttrs={{ color: 'error' }}
      />
      {confirm && (
        <Confirm
          error={error}
          header={`Delete ${record.name}?`}
          description={`This will delete the ${record.type} record for ${record.name} permanently`}
          submit={mutation}
          cancel={() => setConfirm(false)}
          label="Delete"
          loading={loading}
        />
      )}
    </>
  )
}

function RecordsControls({ refetch }) {
  const navigate = useNavigate()

  return (
    <SectionPortal>
      <Box
        direction="row"
        align="center"
        gap="small"
      >
        <Icon
          icon={Refresh}
          onClick={refetch}
          tooltip="refresh list"
        />
        <SecondaryButton
          icon={<Return size="small" />}
          label="Return"
          onClick={() => navigate('/accounts/edit/domains')}
        />
      </Box>
    </SectionPortal>
  )
}

export function DnsRecords() {
  const [listRef, setListRef] = useState(null)
  const { id } = useParams()
  const { data, loading, fetchMore, refetch } = useQuery(DNS_RECORDS, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
  })

  if (!data) return null

  const { dnsRecords: { pageInfo, edges }, ...domain } = data.dnsDomain

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
            mapper={({ node }) => (
              <DnsRecord
                key={node.id}
                record={node}
                domain={domain}
              />
            )}
            loadNextPage={() => pageInfo.hasNextPage && fetchMore({
              variables: { cursor: pageInfo.endCursor },
              updateQuery: (prev, { fetchMoreResult: { dnsDomain } }) => deepUpdate(
                prev,
                'dnsDomain',
                prev => extendConnection(prev, dnsDomain.dnsRecords, 'dnsRecords')
              ),
            })}
          />
        </Box>
      </Box>
      <RecordsControls refetch={refetch} />
    </SectionContentContainer>
  )
}
