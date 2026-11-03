import { useQuery } from '@apollo/client'
import moment from 'moment'
import {
  AppIcon,
  Flex,
  ListBoxItem,
  Modal,
  SearchIcon,
} from '@pluralsh/design-system'
import { useCallback, useMemo, useState } from 'react'
import { useTheme } from 'styled-components'
import isEqual from 'lodash/isEqual'
import uniqWith from 'lodash/uniqWith'

import { Placeholder } from '../utils/Placeholder'
import {
  extendConnection,
  removeConnection,
  updateCache,
} from '../../utils/graphql'
import { GqlError } from '../utils/Alert'
import { StandardScroller } from '../utils/SmoothScroller'
import { Table, TableData, TableRow } from '../utils/Table'
import ListInput from '../utils/ListInput'
import { List } from '../utils/List'
import { Confirm } from '../utils/Confirm'
import { SpanSC } from '../utils/Typography'
import {
  DnsRecordFragment,
  useDeleteDomainMutation,
  useUpdateDomainMutation,
} from '../../generated/graphql'

import LoadingIndicator from '../utils/LoadingIndicator'
import { SubpageHeader } from '../utils/layout/SubpageLayout'

import { DNS_DOMAINS } from './queries'
import { Actions } from './Actions'
import { MoreMenu } from './MoreMenu'
import { BindingInput } from './Typeaheads'
import { sanitize } from './utils'
import { DnsRecords } from './DnsRecords'

function Header({ q, setQ }: any) {
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

function DomainOptions({ domain, setDomain }: any) {
  const [confirm, setConfirm] = useState(false)
  const [edit, setEdit] = useState(false)
  const [mutation, { loading, error }] = useDeleteDomainMutation({
    variables: { id: domain.id },
    update: (cache, { data }) => {
      updateCache(cache, {
        query: DNS_DOMAINS,
        update: (prev) =>
          removeConnection(prev, data?.deleteDomain, 'dnsDomains'),
        variables: {},
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
      props: {},
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
        onSelectionChange={(selectedKey) => {
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
        submit={() => mutation()}
        loading={loading}
        destructive
        error={error}
      />
    </>
  )
}

function AccessPolicy({ domain: { id, accessPolicy }, edit, setEdit }: any) {
  const [bindings, setBindings] = useState(
    accessPolicy ? accessPolicy.bindings : []
  )
  const uniqueBindings = useMemo(() => uniqWith(bindings, isEqual), [bindings])
  const [mutation, { loading, error }] = useUpdateDomainMutation({
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
      open={edit}
      onClose={() => setEdit(false)}
      actions={
        <Actions
          cancel={() => setEdit(false)}
          submit={() => mutation()}
          loading={loading}
          action="Update"
        />
      }
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
          add={(user) => setBindings([...uniqueBindings, { user }])}
          remove={(email) =>
            setBindings(
              uniqueBindings.filter(({ user }) => !user || user.email !== email)
            )
          }
        />
        <BindingInput
          type="group"
          background="fill-two"
          bindings={uniqueBindings
            .filter(({ group }) => !!group)
            .map(({ group: { name } }) => name)}
          add={(group) => setBindings([...uniqueBindings, { group }])}
          remove={(name) =>
            setBindings(
              uniqueBindings.filter(
                ({ group }) => !group || group.name !== name
              )
            )
          }
        />
      </Flex>
    </Modal>
  )
}

function Domain({
  node,
  last,
  setDomain,
}: {
  node: DnsRecordFragment
  last: any
  setDomain: any
}) {
  return (
    <TableRow
      last={last}
      suffix={
        <DomainOptions
          domain={node}
          setDomain={setDomain}
        />
      }
    >
      <TableData>{node.name}</TableData>
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
      <TableData>{moment(node.insertedAt).format('lll')}</TableData>
    </TableRow>
  )
}

function DomainsInner({ q, setDomainSelected }: any) {
  const theme = useTheme()
  const [listRef, setListRef] = useState<any>(null)
  const [domain, setDomain] = useState<any>(null)
  const { data, loading, fetchMore } = useQuery(DNS_DOMAINS, {
    fetchPolicy: 'cache-and-network',
  })

  const setDomainWrapper = useCallback(
    (domain) => {
      setDomainSelected(!!domain)
      setDomain(domain)
    },
    [setDomainSelected, setDomain]
  )

  if (domain) {
    return (
      <DnsRecords
        domain={domain}
        setDomain={setDomainWrapper}
      />
    )
  }

  if (!data) {
    return <LoadingIndicator />
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
          border={theme.borders.default}
          width="100%"
          height="calc(100% - 16px)"
        >
          <Flex
            direction="column"
            width="100%"
            height="100%"
          >
            <StandardScroller
              listRef={listRef}
              setListRef={setListRef}
              hasNextPage={pageInfo?.hasNextPage || false}
              items={edges.filter((e) => e.node?.name?.includes(q))}
              loading={loading}
              placeholder={Placeholder}
              mapper={({ node }, { next }) => (
                <Domain
                  key={node.id}
                  node={node}
                  last={!next.node}
                  setDomain={setDomainWrapper}
                />
              )}
              loadNextPage={() =>
                pageInfo.hasNextPage &&
                fetchMore({
                  variables: { cursor: pageInfo.endCursor },
                  updateQuery: (prev, { fetchMoreResult: { dnsDomains } }) =>
                    extendConnection(prev, dnsDomains, 'dnsDomains'),
                })
              }
            />
          </Flex>
        </Table>
      ) : (
        <span css={{ padding: theme.spacing.medium }}>
          You do not have any domains set yet.
        </span>
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
      <SubpageHeader title="DNS domains" />
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
