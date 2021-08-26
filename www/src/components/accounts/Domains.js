import React, { useCallback, useState } from 'react'
import moment from 'moment'
import { Button } from 'forge-core'
import { useMutation, useQuery } from 'react-apollo'
import { appendConnection, extendConnection, updateCache } from '../../utils/graphql'
import { SectionContentContainer, SectionPortal } from '../Explore'
import { HeaderItem } from '../repos/Docker'
import { StandardScroller } from '../utils/SmoothScroller'
import { Placeholder } from './Audits'
import { CREATE_DOMAIN, DNS_DOMAINS } from './queries'
import { Box, Text, TextInput } from 'grommet'
import Avatar from '../users/Avatar'

export function TableRow({children, border}) {
  return (
    <Box flex={false} border={{side: 'bottom', color: border || 'light-5'}} 
         pad='small' direction='row' align='center' gap='small'>
      {children}
    </Box>
  )
}

function DomainHeader() {
  return (
    <TableRow>
      <HeaderItem text='Name' width='35%' />
      <HeaderItem text='Creator' width='35%' />
      <HeaderItem text='Created On' width='30%' />
    </TableRow>
  )
}

function DomainRow({domain}) {
  return (
    <TableRow>
      <HeaderItem text={domain.name} width='35%' />
      <Box flex={false} width='35%' align='center' direction='row' gap='xsmall'>
        <Avatar user={domain.creator} size='30px' />
        <Text size='small'>{domain.creator.name}</Text>
      </Box>
      <HeaderItem text={moment(domain.insertedAt).format('lll')} width='30%' nobold />
    </TableRow>
  )
}

const rightRadius = (rad) => ({borderTopRightRadius: rad, borderBottomLeftRadius: rad})

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
    update ? mutation() : setUpdate(true)
  ), [update, setUpdate, mutation])

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