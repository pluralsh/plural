import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { Avatar, Flex, Span } from 'honorable'
import moment from 'moment'
import {
  ListBoxItem,
  Modal,
  ModalHeader,
  PageTitle,
} from 'pluralsh-design-system'
import { useMemo, useState } from 'react'

import isEqual from 'lodash/isEqual'
import uniqWith from 'lodash/uniqWith'

import {
  extendConnection,
  removeConnection,
  updateCache,
} from '../../utils/graphql'

import { Placeholder } from '../accounts/Audits'
import { DELETE_DOMAIN, DNS_DOMAINS, UPDATE_DOMAIN } from '../accounts/queries'
import { GqlError } from '../utils/Alert'
import { StandardScroller } from '../utils/SmoothScroller'
import { Table, TableData, TableRow } from '../utils/Table'

import { Actions } from './Actions'

import { Confirm } from './Confirm'

import { MoreMenu } from './MoreMenu'
import { BindingInput } from './Typeaheads'
import { sanitize } from './utils'
import { DnsRecords } from './DnsRecords'

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
      <Modal
        portal
        open={edit}
        onClose={() => setEdit(false)}
        width="100%"
      >
        <ModalHeader onClose={() => setEdit(false)}>
          Edit access policy
        </ModalHeader>
        <AccessPolicy
          domain={domain}
          cancel={() => setEdit(false)}
          setOpen={open => setEdit(open)}
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

function AccessPolicy({ domain: { id, accessPolicy }, cancel, setOpen }) {
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
      setOpen(false)
    },
  })

  return (
    <>
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
      <Actions
        cancel={cancel}
        submit={mutation}
        loading={loading}
        action="Update"
      />
    </>
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
