import React, { useCallback, useState } from 'react'
import moment from 'moment'
import { Button, ModalHeader } from 'forge-core'
import { useMutation, useQuery } from 'react-apollo'
import { appendConnection, extendConnection, updateCache } from '../../utils/graphql'
import { SectionContentContainer, SectionPortal } from '../Explore'
import { HeaderItem } from '../repos/Docker'
import { StandardScroller } from '../utils/SmoothScroller'
import { Placeholder } from './Audits'
import { CREATE_DOMAIN, DNS_DOMAINS, UPDATE_DOMAIN } from './queries'
import { Box, Layer, Text, TextInput } from 'grommet'
import Avatar from '../users/Avatar'
import { Route, Switch, useHistory, useRouteMatch } from 'react-router'
import { DnsRecords } from './DnsRecords'
import { BindingInput, sanitize } from './Role'
import { fetchGroups, fetchUsers } from './Typeaheads'
import { Icon } from './Group'
import { Script } from 'grommet-icons'
import { ignore } from '../utils/ModalHeader'

export function TableRow({children, border, ...props}) {
  return (
    <Box flex={false} border={{side: 'bottom', color: border || 'light-5'}} 
         pad='small' direction='row' align='center' gap='small' {...props}>
      {children}
    </Box>
  )
}

function DomainHeader() {
  return (
    <TableRow>
      <HeaderItem text='Name' width='50%' />
      <HeaderItem text='Creator' width='20%' />
      <HeaderItem text='Created On' width='30%' />
    </TableRow>
  )
}

function DomainRow({domain}) {
  const [open, setOpen] = useState(false)
  let history = useHistory()
  const doOpen = useCallback((value, e) => {
    if (e) ignore(e)
    setOpen(value)
  }, [setOpen])

  return (
    <>
    <TableRow onClick={() => history.push(`/accounts/edit/domains/${domain.id}`)}
      hoverIndicator='light-2'>
      <HeaderItem text={domain.name} width='50%' />
      <Box flex={false} width='20%' align='center' direction='row' gap='xsmall'>
        <Avatar user={domain.creator} size='30px' />
        <Text size='small'>{domain.creator.name}</Text>
      </Box>
      <Box width='30%' direction='row' align='center'>
        <Box fill='horizontal'>
          <Text size='small'>{moment(domain.insertedAt).format('lll')}</Text>
        </Box>
        <Icon
          icon={Script}
          hover='light-4'
          tooltip='Edit Access Policy'
          onClick={(e) => doOpen(true, e)} />
      </Box>
    </TableRow>
    {open && (
      <Layer modal onEsc={(e) => setOpen(false, e)} onClickOutside={(e) => setOpen(false, e)}>
        <Box width='50vw'>
          <ModalHeader text='Set Access Policy' setOpen={setOpen} />
          <UpdateDomainPolicy domain={domain} />
        </Box>
      </Layer>
    )}
    </>
  )
}

const rightRadius = (rad) => ({borderTopRightRadius: rad, borderBottomLeftRadius: rad})

function UpdateDomainPolicy({domain: {id, accessPolicy}}) {
  const [bindings, setBindings] = useState(accessPolicy ? accessPolicy.bindings : [])
  const [mutation, {loading}] = useMutation(UPDATE_DOMAIN, {
    variables: {id, attributes: {accessPolicy: {
      id: accessPolicy ? accessPolicy.id : null,
      bindings: bindings.map(sanitize)
    }}}
  })

  return (
    <Box pad='medium' gap='small'>
      <BindingInput
        type='user'
        bindings={bindings.filter(({user}) => !!user).map(({user: {email}}) => email)}
        fetcher={fetchUsers}
        add={(user) => setBindings([...bindings, {user}])}
        remove={(email) => setBindings(bindings.filter(({user}) => !user || user.email !== email))} />
      <BindingInput
        type='group'
        bindings={bindings.filter(({group}) => !!group).map(({group: {name}}) => name)}
        fetcher={fetchGroups}
        add={(group) => setBindings([...bindings, {group}])}
        remove={(name) => setBindings(bindings.filter(({group}) => !group || group.name !== name))} />
      <Box direction='row' justify='end'>
        <Button label='Update Policy' loading={loading} onClick={mutation} />
      </Box>
    </Box>
  )
}

function CreateDomain() {
  const [update, setUpdate] = useState(false)
  const [name, setName] = useState('')
  const [mutation, {loading}] = useMutation(CREATE_DOMAIN, {
    variables: {attributes: {name: `${name}.onplural.sh`}},
    update: (cache, {data: {createDomain}}) => updateCache(cache, {
      query: DNS_DOMAINS,
      update: (prev) => appendConnection(prev, createDomain, 'dnsDomains')
    }),
    onCompleted: () => setUpdate(false)
  })
  const onClick = useCallback(() => (
    update ? (name === '' ? setUpdate(false) : mutation()) : setUpdate(true)
  ), [update, setUpdate, mutation, name])

  return (
    <SectionPortal>
      <Box width={update ? '400px' : null} direction='row' gap='small' align='center'>
        {update && (
          <Box fill='horizontal' direction='row' align='center'>
            <TextInput
              style={rightRadius('0px')}
              placeholder='domain name' 
              value={name}
              onChange={({target: {value}}) => setName(value)} />
            <Box background='tone-light' pad={{horizontal: 'xsmall'}} border={{color: 'light-5'}}
                 style={{borderLeftStyle: 'none', ...rightRadius('2px')}} height='34px' flex={false} 
                 justify='center' align='center'>
              <Text size='small' weight={500}>.onplural.sh</Text>
            </Box>
          </Box>
        )}
        <Button label='Create' loading={loading} onClick={onClick} />
      </Box>
    </SectionPortal>
  )
}

export function Domains() {
  const [listRef, setListRef] = useState(null)
  const {data, loading, fetchMore} = useQuery(DNS_DOMAINS, {fetchPolicy: 'cache-and-network'})

  if (!data) return null

  const {dnsDomains: {pageInfo, edges}} = data

  return (
    <SectionContentContainer header='Domains'>
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
            mapper={({node}) => <DomainRow key={node.id} domain={node} />} 
            loadNextPage={() => pageInfo.hasNextPage && fetchMore({
              variables: {cursor: pageInfo.endCursor},
              updateQuery: (prev, {fetchMoreResult: {dnsDomains}}) => extendConnection(prev, dnsDomains, 'dnsDomains')
            })} />
        </Box>
      </Box>
      <CreateDomain />
    </SectionContentContainer>
  )
}

export function DnsDirectory() {
  let {url} = useRouteMatch()

  return (
    <Switch>
      <Route exact path={url} component={Domains} />
      <Route path={`${url}/:id`} component={DnsRecords} />
    </Switch>
  )
}