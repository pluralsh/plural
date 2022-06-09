import { useCallback, useState } from 'react'
import moment from 'moment'
import { Button, Roles, Trash } from 'forge-core'
import { useMutation, useQuery } from '@apollo/client'
import { Box, Layer, Text, TextInput } from 'grommet'
import { Route, Routes, useNavigate } from 'react-router-dom'

import { appendConnection, extendConnection, removeConnection, updateCache } from '../../utils/graphql'
import { SectionContentContainer, SectionPortal } from '../Explore'
import { HeaderItem } from '../repos/Docker'
import { StandardScroller } from '../utils/SmoothScroller'

import Avatar from '../users/Avatar'

import { ModalHeader } from '../ModalHeader'

import { ignore } from '../utils/ModalHeader'
import { GqlError } from '../utils/Alert'

import { Placeholder } from './Audits'
import { CREATE_DOMAIN, DELETE_DOMAIN, DNS_DOMAINS, UPDATE_DOMAIN } from './queries'

import { DnsRecords } from './DnsRecords'
import { BindingInput, sanitize } from './Role'
import { fetchGroups, fetchUsers } from './Typeaheads'
import { Icon } from './Group'

export function TableRow({ children, border, ...props }) {
  return (
    <Box
      flex={false}
      border={{ side: 'bottom', color: border || 'border' }}
      pad="small"
      direction="row"
      align="center"
      gap="small"
      {...props}
    >
      {children}
    </Box>
  )
}

function DomainHeader() {
  return (
    <TableRow>
      <HeaderItem
        text="Name"
        width="50%"
      />
      <HeaderItem
        text="Creator"
        width="20%"
      />
      <HeaderItem
        text="Created On"
        width="30%"
      />
    </TableRow>
  )
}

function DomainRow({ domain }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const doOpen = useCallback((value, e) => {
    if (e) ignore(e)
    setOpen(value)
  }, [setOpen])

  return (
    <>
      <TableRow
        onClick={() => navigate(`/accounts/edit/domains/${domain.id}`)}
        hoverIndicator="fill-one"
      >
        <HeaderItem
          text={domain.name}
          width="50%"
        />
        <Box
          flex={false}
          width="20%"
          align="center"
          direction="row"
          gap="xsmall"
        >
          <Avatar
            user={domain.creator}
            size="30px"
          />
          <Text size="small">{domain.creator.name}</Text>
        </Box>
        <Box
          width="30%"
          direction="row"
          align="center"
          gap="small"
        >
          <Box fill="horizontal">
            <Text size="small">{moment(domain.insertedAt).format('lll')}</Text>
          </Box>
          <Icon
            icon={Roles}
            tooltip="Edit Access Policy"
            onClick={e => doOpen('edit', e)}
          />
          <Icon
            icon={Trash}
            tooltip="delete"
            onClick={e => doOpen('delete', e)}
            iconAttrs={{ color: 'error' }}
          />
        </Box>
      </TableRow>
      {open && (
        <Layer
          modal
          onEsc={e => setOpen(false, e)}
          onClickOutside={e => setOpen(false, e)}
        >
          {open === 'edit' && (
            <Box width="50vw">
              <ModalHeader
                text="Set Access Policy"
                setOpen={setOpen}
              />
              <UpdateDomainPolicy domain={domain} />
            </Box>
          )}
          {open === 'delete' && (
            <Box width="50vw">
              <ModalHeader
                text="Delete Domain"
                setOpen={setOpen}
              />
              <DeleteDomain domain={domain} />
            </Box>
          )}
        </Layer>
      )}
    </>
  )
}

function DeleteDomain({ domain: { id } }) {
  const [mutation, { loading, error }] = useMutation(DELETE_DOMAIN, {
    variables: { id },
    update: (cache, { data: { deleteDomain } }) => {
      updateCache(cache, {
        query: DNS_DOMAINS,
        update: prev => removeConnection(prev, deleteDomain, 'dnsDomains'),
      })
    },
  })

  return (
    <Box
      pad="medium"
      gap="small"
    >
      {error && (
        <GqlError
          error={error}
          header="Could not delete domain"
        />
      )}
      <Text size="small">Ensure the domain is empty before deleting</Text>
      <Box
        justify="end"
        direction="row"
        align="center"
      >
        <Button
          label="Delete"
          background="error"
          loading={loading}
          onClick={mutation}
        />
      </Box>
    </Box>
  )
}

const rightRadius = rad => ({ borderTopRightRadius: rad, borderBottomLeftRadius: rad })

function UpdateDomainPolicy({ domain: { id, accessPolicy } }) {
  const [bindings, setBindings] = useState(accessPolicy ? accessPolicy.bindings : [])
  const [mutation, { loading }] = useMutation(UPDATE_DOMAIN, {
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
      <BindingInput
        type="user"
        bindings={bindings.filter(({ user }) => !!user).map(({ user: { email } }) => email)}
        fetcher={fetchUsers}
        add={user => setBindings([...bindings, { user }])}
        remove={email => setBindings(bindings.filter(({ user }) => !user || user.email !== email))}
      />
      <BindingInput
        type="group"
        bindings={bindings.filter(({ group }) => !!group).map(({ group: { name } }) => name)}
        fetcher={fetchGroups}
        add={group => setBindings([...bindings, { group }])}
        remove={name => setBindings(bindings.filter(({ group }) => !group || group.name !== name))}
      />
      <Box
        direction="row"
        justify="end"
      >
        <Button
          label="Update Policy"
          loading={loading}
          onClick={mutation}
        />
      </Box>
    </Box>
  )
}

function CreateDomain() {
  const [update, setUpdate] = useState(false)
  const [name, setName] = useState('')
  const [mutation, { loading }] = useMutation(CREATE_DOMAIN, {
    variables: { attributes: { name: `${name}.onplural.sh` } },
    update: (cache, { data: { createDomain } }) => updateCache(cache, {
      query: DNS_DOMAINS,
      update: prev => appendConnection(prev, createDomain, 'dnsDomains'),
    }),
    onCompleted: () => setUpdate(false),
  })
  const onClick = useCallback(() => (
    update ? (name === '' ? setUpdate(false) : mutation()) : setUpdate(true)
  ), [update, setUpdate, mutation, name])

  return (
    <SectionPortal>
      <Box
        width={update ? '400px' : null}
        direction="row"
        gap="small"
        align="center"
      >
        {update && (
          <Box
            fill="horizontal"
            direction="row"
            align="center"
          >
            <TextInput
              style={rightRadius('0px')}
              placeholder="domain name"
              value={name}
              onChange={({ target: { value } }) => setName(value)}
            />
            <Box
              background="tone-light"
              pad={{ horizontal: 'xsmall' }}
              border={{ color: 'border' }}
              style={{ borderLeftStyle: 'none', ...rightRadius('2px') }}
              height="34px"
              flex={false}
              justify="center"
              align="center"
            >
              <Text
                size="small"
                weight={500}
              >.onplural.sh
              </Text>
            </Box>
          </Box>
        )}
        <Button
          label="Create"
          loading={loading}
          onClick={onClick}
        />
      </Box>
    </SectionPortal>
  )
}

export function Domains() {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(DNS_DOMAINS, { fetchPolicy: 'cache-and-network' })

  if (!data) return null

  const { dnsDomains: { pageInfo, edges } } = data

  return (
    <SectionContentContainer header="Domains">
      <Box fill>
        <DomainHeader />
        <Box fill>
          <StandardScroller
            listRef={listRef}
            setListRef={setListRef}
            hasNextPage={pageInfo.hasNextPage}
            items={edges}
            loading={loading}
            placeholder={Placeholder}
            mapper={({ node }) => (
              <DomainRow
                key={node.id}
                domain={node}
              />
            )}
            loadNextPage={() => pageInfo.hasNextPage && fetchMore({
              variables: { cursor: pageInfo.endCursor },
              updateQuery: (prev, { fetchMoreResult: { dnsDomains } }) => extendConnection(prev, dnsDomains, 'dnsDomains'),
            })}
          />
        </Box>
      </Box>
      <CreateDomain />
    </SectionContentContainer>
  )
}

export function DnsDirectory() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Domains />}
      />
      <Route
        path="/:id"
        element={<DnsRecords />}
      />
    </Routes>
  )
}
