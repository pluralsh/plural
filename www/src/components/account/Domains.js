import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { Avatar, Flex, Span } from 'honorable'
import moment from 'moment'
import {
  ArrowLeftIcon,
  IconFrame,
  ListBoxItem,
  Modal,
  ModalHeader,
  PageTitle,
} from 'pluralsh-design-system'
import { useMemo, useState } from 'react'

import { isEqual, uniqWith } from 'lodash'

import {
  deepUpdate,
  extendConnection,
  removeConnection,
  updateCache,
} from '../../utils/graphql'

import { Placeholder } from '../accounts/Audits'
import {
  DELETE_DNS_RECORD,
  DELETE_DOMAIN,
  DNS_DOMAINS,
  DNS_RECORDS,
  UPDATE_DOMAIN,
} from '../accounts/queries'
import { DeleteIconButton } from '../utils/IconButtons'
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

  const menuItems = {
    viewDNSRecords: {
      label: 'View DNS Records',
      onSelect: () => setDomain(domain),
      props: {},
    },
    editAccessPolicy: {
      label: 'Edit Access Policy',
      onSelect: () => setEdit(true),
    },
    delete: {
      label: 'Delete',
      onSelect: () => setConfirm(true),
      props: {
        destructive: true,
      },
    },
  }

  return (
    <>
      <MoreMenu
        onSelectionChange={selectedKey => {
          menuItems[selectedKey]?.onSelect()
        }}
      >
        {Object.entries(menuItems).map(([key, { label, props = {} }]) => (
          <ListBoxItem
            key={key}
            textValue={label}
            label={label}
            {...props}
            color="blue"
          />
        ))}
      </MoreMenu>
      <Modal
        portal
        open={edit}
        title="UPDATE ACCESS POLICY"
        onClose={() => setEdit(false)}
      >
        <ModalHeader onClose={() => setEdit(false)}>
          EDIT ACCESS POLICY
        </ModalHeader>
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
        destructive
        error={error}
      />
    </>
  )
}

function AccessPolicy({ domain: { id, accessPolicy }, cancel }) {
  const [bindings, setBindings] = useState(accessPolicy ? accessPolicy.bindings : [])
  const uniqueBindings = useMemo(() => uniqWith(bindings, isEqual), [bindings])
  const [mutation, { loading, error }] = useMutation(UPDATE_DOMAIN, {
    variables: {
      id,
      attributes: {
        accessPolicy: {
          id: accessPolicy ? accessPolicy.id : null,
          bindings: uniqueBindings.map(sanitize),
        },
      },
    },
  })

  return (
    <Box
      pad="medium"
      gap="small"
      width="500px"
      minHeight="250px"
    >
      {error && (
        <GqlError
          error={error}
          header="Something broke"
        />
      )}
      <BindingInput
        type="user"
        background="fill-two"
        bindings={uniqueBindings
          .filter(({ user }) => !!user)
          .map(({ user: { email } }) => email)}
        add={user => setBindings([...uniqueBindings, { user }])}
        remove={email => setBindings(uniqueBindings.filter(({ user }) => !user || user.email !== email))}
      />
      <BindingInput
        type="group"
        background="fill-two"
        bindings={uniqueBindings
          .filter(({ group }) => !!group)
          .map(({ group: { name } }) => name)}
        add={group => setBindings([...uniqueBindings, { group }])}
        remove={name => setBindings(uniqueBindings.filter(({ group }) => !group || group.name !== name))}
      />
      <Actions
        cancel={cancel}
        submit={mutation}
        loading={loading}
        action="Update"
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
      update: prev => deepUpdate(prev, 'dnsDomain', domain => removeConnection(domain, deleteDnsRecord, 'dnsRecords')),
    }),
  })

  return (
    <>
      <DeleteIconButton onClick={() => setConfirm(true)} />
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

  const {
    dnsRecords: { pageInfo, edges },
  } = data.dnsDomain

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
        round="xsmall"
      >
        <IconFrame
          clickable
          size="medium"
          icon={<ArrowLeftIcon />}
          onClick={() => setDomain(null)}
        />
        <Span fontWeight="bold">{domain.name}</Span>
      </Box>
      <Table
        headers={['Name', 'Type', 'Cluster', 'Creator', 'Created On']}
        sizes={['20%', '20%', '20%', '20%', '20%']}
        background="fill-one"
        border="1px solid border"
        marginTop="medium"
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

function Domain({ node, last, setDomain }) {
  return (
    <TableRow
      last={last}
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
  )
}

export function Domains() {
  const [listRef, setListRef] = useState(null)
  const [domain, setDomain] = useState(null)
  const { data, loading, fetchMore } = useQuery(DNS_DOMAINS, {
    fetchPolicy: 'cache-and-network',
  })

  if (!data) return null

  if (domain) {
    return (
      <DnsRecords
        domain={domain}
        setDomain={setDomain}
      />
    )
  }

  const {
    dnsDomains: { pageInfo, edges },
  } = data

  return (
    <Flex
      flexGrow={1}
      flexDirection="column"
      maxHeight="100%"
    >
      <PageTitle heading="Domains" />
      {edges?.length ? (
        <Table
          headers={['Name', 'Creator', 'Created On']}
          sizes={['33%', '33%', '33%']}
          background="fill-one"
          border="1px solid border"
          width="100%"
          height="calc(100% - 16px)"
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
                <Domain
                  node={node}
                  last={!next.node}
                  setDomain={setDomain}
                />
              )}
              loadNextPage={() => pageInfo.hasNextPage
                && fetchMore({
                  variables: { cursor: pageInfo.endCursor },
                  updateQuery: (prev, { fetchMoreResult: { invites } }) => extendConnection(prev, invites, 'invites'),
                })}
            />
          </Box>
        </Table>
      ) : (
        <Span>You do not have any domains set yet.</Span>
      )}
    </Flex>
  )
}
