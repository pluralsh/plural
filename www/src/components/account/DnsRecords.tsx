import { useQuery } from '@apollo/client'
import moment from 'moment'
import { useState } from 'react'
import { AppIcon, ArrowLeftIcon, Button, Flex } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

import { Placeholder } from '../utils/Placeholder'
import {
  deepUpdate,
  extendConnection,
  removeConnection,
  updateCache,
} from '../../utils/graphql'
import { DeleteIconButton } from '../utils/IconButtons'
import { StandardScroller } from '../utils/SmoothScroller'
import { Table, TableData, TableRow } from '../utils/Table'
import { ProviderIcon } from '../utils/ProviderIcon'
import { Confirm } from '../utils/Confirm'
import { Body2P, CaptionP, SpanSC } from '../utils/Typography'

import { useDeleteDnsRecordMutation } from '../../generated/graphql'

import { DNS_RECORDS } from './queries'

function DeleteRecord({ record, domain }: any) {
  const theme = useTheme()
  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading, error }] = useDeleteDnsRecordMutation({
    variables: { name: record.name, type: record.type },
    update: (cache, { data }) =>
      updateCache(cache, {
        query: DNS_RECORDS,
        variables: { id: domain.id },
        update: (prev) =>
          deepUpdate(prev, 'dnsDomain', (domain) =>
            removeConnection(domain, data?.deleteDnsRecord, 'dnsRecords')
          ),
      }),
    onCompleted: () => setConfirm(false),
  })

  return (
    <>
      <DeleteIconButton
        onClick={() => setConfirm(true)}
        css={{ marginLeft: theme.spacing.small }}
      />
      <Confirm
        open={confirm}
        error={error}
        title={`Delete ${record.name}?`}
        text={`This will delete the ${record.type} record for ${record.name} permanently`}
        submit={() => mutation()}
        close={() => setConfirm(false)}
        label="Delete"
        loading={loading}
      />
    </>
  )
}

export function DnsRecords({ domain, setDomain }: any) {
  const theme = useTheme()
  const [listRef, setListRef] = useState<any>(null)
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
    <Flex
      direction="column"
      width="100%"
      height="100%"
    >
      <Flex margin="xxxsmall">
        <Button
          tertiary
          onClick={(e) => {
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
        border={theme.borders.default}
        width="100%"
        height="100%"
      >
        <Flex
          direction="column"
          width="100%"
          height="100%"
        >
          <StandardScroller
            listRef={listRef}
            setListRef={setListRef}
            hasNextPage={pageInfo.hasNextPage}
            items={edges}
            loading={loading}
            placeholder={Placeholder}
            mapper={({ node }, { next }) => (
              <TableRow
                key={node.id}
                last={!next.node}
                suffix={
                  <DeleteRecord
                    record={node}
                    domain={domain}
                  />
                }
              >
                <TableData>{node.name}</TableData>
                <TableData>{node.type}</TableData>
                <TableData>
                  <Flex
                    flex="0 0 auto"
                    direction="row"
                    gap="xsmall"
                    align="center"
                  >
                    <ProviderIcon
                      provider={node.provider}
                      width={30}
                    />
                    <SpanSC $color="text-light">{node.cluster}</SpanSC>
                  </Flex>
                </TableData>
                <TableData>
                  <Flex direction="column">
                    <Body2P
                      as="div"
                      $color="text-light"
                    >
                      {moment(node.insertedAt).format('ll')}
                    </Body2P>
                    <CaptionP
                      as="div"
                      $color="text-xlight"
                    >
                      {moment(node.insertedAt).format('LT')}
                    </CaptionP>
                  </Flex>
                </TableData>
                <TableData>
                  <Flex
                    direction="row"
                    gap="xsmall"
                    align="center"
                  >
                    <AppIcon
                      url={node?.creator?.avatar || undefined}
                      name={node.creator?.name || undefined}
                      size="xxsmall"
                      spacing={node?.creator?.avatar ? 'none' : undefined}
                    />
                    <SpanSC $color="text-light">{node.creator?.name}</SpanSC>
                  </Flex>
                </TableData>
              </TableRow>
            )}
            loadNextPage={() =>
              pageInfo.hasNextPage &&
              fetchMore({
                variables: { cursor: pageInfo.endCursor },
                updateQuery: (prev, { fetchMoreResult: { dnsDomain } }) =>
                  deepUpdate(prev, 'dnsDomain', (prev) =>
                    extendConnection(prev, dnsDomain.dnsRecords, 'dnsRecords')
                  ),
              })
            }
          />
        </Flex>
      </Table>
    </Flex>
  )
}
