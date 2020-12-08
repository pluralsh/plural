import React, { useState, useRef } from 'react'
import { Box, Text, Collapsible, Layer, TextInput } from 'grommet'
import { useQuery, useMutation, useApolloClient } from 'react-apollo'
import { GROUP_MEMBERS, CREATE_GROUP_MEMBERS, UPDATE_GROUP, DELETE_GROUP } from './queries'
import { Group, UserAdd, Search, Edit, Trash } from 'grommet-icons'
import { Scroller, Loading, ModalHeader, TooltipContent, Button } from 'forge-core'
import { UserRow } from './User'
import { fetchUsers } from './Typeaheads'
import { addGroupMember, deleteGroup } from './utils'

function GroupMembers({group}) {
  const {data, fetchMore} = useQuery(GROUP_MEMBERS, {variables: {id: group.id}})
  if (!data) return <Loading />
  const {groupMembers: {pageInfo, edges}} = data

  return (
    <Scroller
      id={`group-members-${group.id}`}
      style={{height: '100%', overflow: 'auto'}}
      edges={edges}
      mapper={({node}, next) => <UserRow key={node.id} user={node.user} next={next.node} />}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({variables: {cursor: pageInfo.endCursor}})} />
  )
}

export function Icon({icon, iconAttrs, tooltip, onClick}) {
  const dropRef = useRef()
  const [open, setOpen] = useState(false)
  return (
    <>
    <Box
      ref={dropRef}
      pad='small'
      round='xsmall'
      onClick={onClick}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      hoverIndicator='light-2'
      focusIndicator={false}>
      {React.createElement(icon, {size: '14px', ...(iconAttrs || {})})}
    </Box>
    {open && (
      <TooltipContent
        pad='xsmall'
        round='xsmall'
        justify='center'
        targetRef={dropRef}
        margin={{bottom: 'xsmall'}}
        side='top'
        align={{bottom: 'top'}}>
        <Text size='small' style={{fontWeight: 500}}>{tooltip}</Text>
      </TooltipContent>
    )}
    </>
  )
}

function MemberAdd({group, setModal}) {
  const client = useApolloClient()
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [mutation] = useMutation(CREATE_GROUP_MEMBERS, {
    variables: {groupId: group.id},
    update: (cache, {data: {createGroupMember}}) => {
      try {
        addGroupMember(cache, group, createGroupMember)
      } catch {
        // igonre
      }
    },
    onCompleted: () => setModal(null)
  })

  return (
    <Box gap='small' pad='medium'>
      <TextInput
        icon={<Search />}
        placeholder='search for a user'
        value={q}
        suggestions={suggestions}
        onSelect={({suggestion: {value}}) => {
          setQ(value.name)
          mutation({variables: {userId: value.id}})
        }}
        onChange={({target: {value}}) => {
          setQ(value)
          fetchUsers(client, value, setSuggestions)
        }} />
    </Box>
  )
}

function GroupName({group: {name, description}}) {
  return (
    <Box fill='horizontal' gap='xsmall' direction='row'>
      <Text size='small' weight={500}>{name}</Text>
      <Text size='small'>--</Text>
      <Text size='small'><i>{description || 'no description'}</i></Text>
    </Box>
  )
}

function GroupEdit({group, setEdit}) {
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description)
  const [mutation, {loading}] = useMutation(UPDATE_GROUP, {
    variables: {id: group.id, attributes: {name, description}},
    onCompleted: () => setEdit(false)
  })

  return (
    <Box fill='horizontal' gap='xsmall' direction='row'>
      <Box width='70%' direction='row' align='center' gap='xsmall'>
        <TextInput
          name='name'
          value={name}
          onChange={({target: {value}}) => setName(value)} />
        <Box flex={false}>
          <Text size='small'>--</Text>
        </Box>
        <TextInput
          name='description'
          value={description || ''}
          placeholder='enter a description'
          onChange={({target: {value}}) => setDescription(value)} />
      </Box>
      <Button label='update' loading={loading} onClick={mutation} />
    </Box>
  )
}

export default function GroupRow({group}) {
  const ref = useRef()
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const [edit, setEdit] = useState(false)
  const [mutation] = useMutation(DELETE_GROUP, {
    variables: {id: group.id},
    update: (cache, {data}) => deleteGroup(cache, data.deleteGroup)
  })

  return (
    <Box ref={ref} border='bottom'>
      <Box direction='row' pad='small' align='center'>
        {edit ? <GroupEdit group={group} setEdit={setEdit} /> : <GroupName group={group} />}
        <Box flex={false} direction='row'>
          <Icon icon={Edit} tooltip='edit' onClick={() => setEdit(!edit)} />
          <Icon
            icon={UserAdd}
            tooltip='add user'
            onClick={() => setModal({
              text: `Add user to ${group.name}`,
              body: <MemberAdd group={group} setModal={setModal} />
            })} />
          <Icon icon={Group} tooltip='members' onClick={() => setOpen(!open)} />
          <Icon icon={Trash} tooltip='delete' onClick={mutation} iconAttrs={{color: 'error'}} />
        </Box>
      </Box>
      <Collapsible open={open} direction='vertical'>
        <Box pad='small'>
          {open && <GroupMembers group={group} />}
        </Box>
      </Collapsible>
      {modal && (
        <Layer modal position='center' onClickOutside={() => setOpen(false)} onEsc={() => setOpen(false)}>
          <Box width='30vw'>
            <ModalHeader text={modal.text} setOpen={setModal} />
            {modal.body}
          </Box>
        </Layer>
      )}
    </Box>
  )
}