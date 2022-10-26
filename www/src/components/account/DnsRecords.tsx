import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import {
  Avatar,
  Button,
  Div,
  Flex,
  Span,
} from 'honorable'
import moment from 'moment'
import { useState } from 'react'
import { ArrowLeftIcon } from 'pluralsh-design-system'

import { Placeholder } from '../utils/Placeholder'

import {
  deepUpdate,
  extendConnection,
  removeConnection,
  updateCache,
} from '../../utils/graphql'

import { DeleteIconButton } from '../utils/IconButtons'
import { Provider } from '../repos/misc'
import { StandardScroller } from '../utils/SmoothScroller'
import { Table, TableData, TableRow } from '../utils/Table'

import { DELETE_DNS_RECORD, DNS_RECORDS } from './queries'

import { Confirm } from './Confirm'

function DeleteRecord({ record, domain }: any) {
  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading, error }] = useMutation(DELETE_DNS_RECORD, {
    variables: { name: record.name, type: record.type },
    update: (cache, { data: { deleteDnsRecord } }) => updateCache(cache, {
      query: DNS_RECORDS,
      variables: { id: domain.id },
      update: prev => deepUpdate(prev, 'dnsDomain', domain => removeConnection(domain, deleteDnsRecord, 'dnsRecords')),
    }),
    onCompleted: () => setConfirm(false),
  })

  return (
    <>
      <DeleteIconButton
        onClick={() => setConfirm(true)}
        marginLeft="small"
      />
      <Confirm
        open={confirm}
        error={error}
        title={`Delete ${record.name}?`}
        text={`This will delete the ${record.type} record for ${record.name} permanently`}
        submit={mutation}
        close={() => setConfirm(false)}
        label="Delete"
        loading={loading}
      />
    </>
  )
}

export function DnsRecords({ domain, setDomain }: any) {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(DNS_RECORDS, {
    variables: { id: domain.id },
    fetchPolicy: 'cache-and-network',
  })

  if (!data) {
    return null
  }

  const {
    dnsRecords: { pageInfo, edges },
  } = data.dnsDomain

  return (
    <Box fill>
      <Flex margin="xxxsmall">
        <Button
          tertiary
          textDecoration="none"
          onClick={e => {
            e.preventDefault()
            setDomain(null)
          }}
          startIcon={<ArrowLeftIcon />}
        >
          Back
        </Button>
      </Flex>
      <Table
        heading={domain.name}
        headers={['Name', 'Type', 'Cluster', 'Created', 'Creator']}
        sizes={['40%', '80px', '20%', '120px', '20%']}
        background="fill-one"
        border="1px solid border"
        width="100%"
        height="100%"
      >
        <Box fill>
          <StandardScroller
            listRef={listRef}
            setListRef={setListRef}
            hasNextPage={pageInfo.hasNextPage}
            items={edges}
            loading={loading}
            placeholder={Placeholder}
            mapper={({ node }, { next }) => (
              <TableRow
                last={!next.node}
                suffix={(
                  <DeleteRecord
                    record={node}
                    domain={domain}
                  />
                )}
              >
                <TableData>{node.name}</TableData>
                <TableData>{node.type}</TableData>
                <TableData>
                  <Box
                    flex={false}
                    direction="row"
                    gap="xsmall"
                    align="center"
                  >
                    <Provider
                      provider={node.provider}
                      width={30}
                    />
                    <Span color="text-light">{node.cluster}</Span>
                  </Box>
                </TableData>
                <TableData>
                  <Flex direction="column">
                    <Div
                      body2
                      color="text-light"
                    >
                      {moment(node.insertedAt).format('ll')}
                    </Div>
                    <Div
                      caption
                      color="text-xlight"
                    >
                      {moment(node.insertedAt).format('LT')}
                    </Div>
                  </Flex>
                </TableData>
                <TableData>
                  <Box
                    direction="row"
                    gap="xsmall"
                    align="center"
                  >
                    <Avatar
                      src={node.creator.avatar}
                      name={node.creator.name}
                      size={30}
                    />
                    <Span color="text-light">{node.creator.name}</Span>
                  </Box>
                </TableData>
              </TableRow>
            )}
            loadNextPage={() => pageInfo.hasNextPage
              && fetchMore({
                variables: { cursor: pageInfo.endCursor },
                updateQuery: (prev, { fetchMoreResult: { dnsDomain } }) => deepUpdate(prev, 'dnsDomain', prev => extendConnection(prev, dnsDomain.dnsRecords, 'dnsRecords')),
              })}
          />
        </Box>
      </Table>
    </Box>
  )
}
