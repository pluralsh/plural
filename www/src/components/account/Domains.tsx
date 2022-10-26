import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { Avatar, Flex, Span } from 'honorable'
import moment from 'moment'
import {
  ListBoxItem,
  Modal,
  PageTitle,
  SearchIcon,
} from 'pluralsh-design-system'
import { useCallback, useMemo, useState } from 'react'

import isEqual from 'lodash/isEqual'
import uniqWith from 'lodash/uniqWith'
import { Placeholder } from 'components/utils/Placeholder'

import { extendConnection, removeConnection, updateCache } from '../../utils/graphql'
import { GqlError } from '../utils/Alert'
import { StandardScroller } from '../utils/SmoothScroller'
import { Table, TableData, TableRow } from '../utils/Table'
import ListInput from '../utils/ListInput'

import { List } from '../utils/List'

import { DELETE_DOMAIN, DNS_DOMAINS, UPDATE_DOMAIN } from './queries'
import { Actions } from './Actions'
import { Confirm } from './Confirm'
import { MoreMenu } from './MoreMenu'
import { BindingInput } from './Typeaheads'
import { sanitize } from './utils'
import { DnsRecords } from './DnsRecords'

function Header({ q, setQ }) {
  return (
    <ListInput
      width="100%"
      value={q}
      placeholder="Search a domain"
      startIcon={<SearchIcon color="text-light" />}
      onChange={({ target: { value } }) => setQ(value)}
      flexGrow={0}
    />
  )
}

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
    onCompleted: () => setEdit(false),
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
      <AccessPolicy
        domain={domain}
        edit={edit}
        setEdit={setEdit}
      />
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

function AccessPolicy({ domain: { id, accessPolicy }, edit, setEdit }) {
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
    onCompleted: () => {
      setBindings([])
      setEdit(false)
    },
  })

  return (
    <Modal
      header="Edit access policy"
      portal
      open={edit}
      onClose={() => setEdit(false)}
      width="100%"
      actions={(
        <Actions
          cancel={() => setEdit(false)}
          submit={mutation}
          loading={loading}
          action="Update"
        />
      )}
    >
      <Flex
        direction="column"
        gap="large"
      >
        {error && (
          <GqlError
            error={error}
            header="Something went wrong"
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
      </Flex>
    </Modal>
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

function DomainsInner({ q, setDomainSelected }) {
  const [listRef, setListRef] = useState(null)
  const [domain, setDomain] = useState(null)
  const { data, loading, fetchMore } = useQuery(DNS_DOMAINS, {
    fetchPolicy: 'cache-and-network',
  })

  const setDomainWrapper = useCallback(domain => {
    setDomainSelected(!!domain)
    setDomain(domain)
  }, [setDomainSelected, setDomain])

  if (!data) return null

  if (domain) {
    return (
      <DnsRecords
        domain={domain}
        setDomain={setDomainWrapper}
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
              hasNextPage={pageInfo?.hasNextPage || false}
              items={edges.filter(e => e.node?.name?.includes(q))}
              loading={loading}
              placeholder={Placeholder}
              mapper={({ node }, { next }) => (
                <Domain
                  node={node}
                  last={!next.node}
                  setDomain={setDomainWrapper}
                />
              )}
              loadNextPage={() => pageInfo.hasNextPage
                && fetchMore({
                  variables: { cursor: pageInfo.endCursor },
                  updateQuery: (prev, { fetchMoreResult: { dnsDomains } }) => extendConnection(prev, dnsDomains, 'dnsDomains'),
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

export function Domains() {
  const [q, setQ] = useState('')
  const [domainSelected, setDomainSelected] = useState(false)

  return (
    <Flex
      flexGrow={1}
      flexDirection="column"
      maxHeight="100%"
    >
      <PageTitle heading="Domains" />
      <List>
        {!domainSelected && (
          <Header
            q={q}
            setQ={setQ}
          />
        )}
        <DomainsInner
          q={q}
          setDomainSelected={setDomainSelected}
        />
      </List>
    </Flex>
  )
}
