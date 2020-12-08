import React, { useState } from 'react'
import { ModalHeader, Button, ResponsiveInput, InputCollection } from 'forge-core'
import { Layer, Box } from 'grommet'
import { useMutation } from 'react-apollo'
import { CREATE_GROUP, GROUPS_Q } from './queries'

export function GroupForm() {
  const [name, setName] = useState('')
  const [mutation, {loading}] = useMutation(CREATE_GROUP, {
    variables: {attributes: {name}},
    update: (cache, {data: {createGroup}}) => {
      const {groups, ...data} = cache.readQuery({query: GROUPS_Q, variables: {q: null}})
      cache.writeQuery({
        query: GROUPS_Q,
        variables: {q: null},
        data: {
          ...data,
          groups: {...groups, edges: [{__typename: "GroupEdge", node: createGroup}, ...groups.edges]}
      }})
    }
  })

  return (
    <Box gap='small'>
      <InputCollection>
        <ResponsiveInput
          label='name'
          value={name}
          placeholder='short name'
          onChange={({target: {value}}) => setName(value)} />
      </InputCollection>
      <Box direction='row' justify='end'>
        <Button label='create' onClick={mutation} loading={loading} />
      </Box>
    </Box>
  )
}

export default function CreateGroup() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button label='Create' onClick={() => setOpen(true)} />
      {open && (
        <Layer modal position='center' onClickOutside={() => setOpen(false)} onEsc={() => setOpen(false)}>
          <Box width='30vw'>
            <ModalHeader text='Create a new group' setOpen={setOpen} />
            <Box pad='small'>
              <GroupForm />
            </Box>
          </Box>
        </Layer>
      )}
    </>
  )
}