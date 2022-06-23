import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { Return } from 'grommet-icons'
import { Avatar, MenuItem, Span } from 'honorable'
import moment from 'moment'
import { Modal } from 'pluralsh-design-system'
import { useState } from 'react'

import { deepUpdate, extendConnection, removeConnection, updateCache } from '../../utils/graphql'

import { Placeholder } from '../accounts/Audits'
import { DELETE_DNS_RECORD, DELETE_DOMAIN, DNS_DOMAINS, DNS_RECORDS, UPDATE_DOMAIN } from '../accounts/queries'
import { DeleteIcon, Icon } from '../profile/Icon'
import { Provider } from '../repos/misc'
import { GqlError } from '../utils/Alert'
import { StandardScroller } from '../utils/SmoothScroller'
import { Table, TableData, TableRow } from '../utils/Table'

import { Actions } from './Actions'

import { Confirm } from './Confirm'

import { MoreMenu } from './MoreMenu'
import { BindingInput } from './Typeaheads'
import { sanitize } from './utils'

function DomainOptions({ domain, setDomain }) {
  const [confirm, setConfirm] = useState(false)
  const [edit, setEdit] = useState(false)
  const [mutation, { loading, error }] = useMutation(DELETE_DOMAIN, {
    variables: { id: domain.id },
    update: (cache, { data: { deleteDomain } }) => {
      updateCache(cache, {
        query: DNS_DOMAINS,
        update: prev => removeConnection(prev, deleteDomain, 'dnsDomains'),
      })
    },
  })

  return (
    <>
      <MoreMenu>
        <MenuItem onClick={() => setDomain(domain)}><Span color="text-light">View DNS Records</Span></MenuItem>
        <MenuItem onClick={() => setEdit(true)}><Span color="text-light">Edit Access Policy</Span></MenuItem>
        <MenuItem onClick={() => setConfirm(true)}><Span color="text-error">Delete</Span></MenuItem>
      </MoreMenu>
      <Modal
        open={edit}
        title="UPDATE ACCESS POLICY"
        onClose={() => setEdit(false)}
      >
        <AccessPolicy
          domain={domain}
          cancel={() => setEdit(false)}
        />
      </Modal>
      <Confirm
        open={confirm}
        text="Make sure the domain is empty before deleting"
        close={() => setConfirm(false)}
        submit={mutation}
        loading={loading}
        error={error}
      /> 
    </>
  )
}

function AccessPolicy({ domain: { id, accessPolicy }, cancel }) {
  const [bindings, setBindings] = useState(accessPolicy ? accessPolicy.bindings : [])
  const [mutation, { loading, error }] = useMutation(UPDATE_DOMAIN, {
    variables: { id,
      attributes: { accessPolicy: {
        id: accessPolicy ? accessPolicy.id : null,
        bindings: bindings.map(sanitize),
      } } },
  })

  return (
    <Box
      pad="medium"
      gap="small"
    >
      {error && (
        <GqlError
          error={error}
          header="Something broke"
        />
      )}
      <BindingInput
        type="user"
        bindings={bindings.filter(({ user }) => !!user).map(({ user: { email } }) => email)}
        add={user => setBindings([...bindings, { user }])}
        remove={email => setBindings(bindings.filter(({ user }) => !user || user.email !== email))}
      />
      <BindingInput
        type="group"
        bindings={bindings.filter(({ group }) => !!group).map(({ group: { name } }) => name)}
        add={group => setBindings([...bindings, { group }])}
        remove={name => setBindings(bindings.filter(({ group }) => !group || group.name !== name))}
      />
      <Actions
        cancel={cancel}
        submit={mutation}
        loading={loading}
      />
    </Box>
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
      <DeleteIcon
        onClick={() => setConfirm(true)}
      />
      <Confirm
        open={confirm}
        error={error}
        title={`Delete ${record.name}?`}
        text={`This will delete the ${record.type} record for ${record.name} permanently`}
        submit={mutation}
        cancel={() => setConfirm(false)}
        label="Delete"
        loading={loading}
      />
    </>
  )
}

function DnsRecords({ domain, setDomain }) {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(DNS_RECORDS, {
    variables: { id: domain.id },
    fetchPolicy: 'cache-and-network',
  })

  if (!data) return null

  const { dnsRecords: { pageInfo, edges } } = data.dnsDomain

  return (
    <Box
      fill
      pad={{ vertical: 'small' }}
    >
      <Box
        direction="row"
        gap="small"
        align="center"
        pad="small"
        background="fill-one"
        border
      >
        <Icon
          icon={<Return size="15px" />}
          onClick={() => setDomain(null)}
        />
        <Span fontWeight="bold">{domain.name}</Span>
      </Box> 
      <Table
        headers={['Name', 'Type', 'Cluster', 'Creator', 'Created On']}
        sizes={['20%', '20%', '20%', '20%', '20%']}
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
                  <Box
                    direction="row"
                    gap="xsmall"
                    align="center"
                  >
                    <Avatar
                      src={node.creator.avatar}
                      name={node.creator.name}
                      size={25}
                    />
                    <Span color="text-light">{node.creator.name}</Span>
                  </Box>
                </TableData>
                <TableData>{moment(node.insertedAt).format('lll')}</TableData>
              </TableRow>
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
      </Table>
    </Box>
  )
}

export function Domains() {
  const [listRef, setListRef] = useState(null)
  const [domain, setDomain] = useState(null)
  const { data, loading, fetchMore } = useQuery(DNS_DOMAINS, { fetchPolicy: 'cache-and-network' })
  
  if (!data) return null

  if (domain) {
    return (
      <DnsRecords
        domain={domain}
        setDomain={setDomain}
      />
    )
  }
  
  const { dnsDomains: { pageInfo, edges } } = data
  
  return (
    <Box
      fill
    >
      <Table
        headers={['Name', 'Creator', 'Created On']}
        sizes={['33%', '33%', '33%']}
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
                  <DomainOptions
                    domain={node}
                    setDomain={setDomain}
                  />
                )}
              >
                <TableData>{node.name}</TableData>
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
                <TableData>{moment(node.insertedAt).format('lll')}</TableData>
              </TableRow>
            )}
            loadNextPage={() => pageInfo.hasNextPage && fetchMore({
              variables: { cursor: pageInfo.endCursor },
              updateQuery: (prev, { fetchMoreResult: { invites } }) => extendConnection(prev, invites, 'invites'),
            })}
          />
        </Box>
      </Table>
    </Box>
  )
}
