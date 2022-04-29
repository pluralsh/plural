import { useState } from 'react'
import { Button, GqlError, InputCollection } from 'forge-core'
import { Box, Layer } from 'grommet'
import { useMutation } from '@apollo/client'

import ResponsiveInput from '../ResponsiveInput'
import { ModalHeader } from '../ModalHeader'

import { CREATE_GROUP, GROUPS_Q } from './queries'

export function GroupForm() {
  const [name, setName] = useState('')
  const [mutation, { loading, error }] = useMutation(CREATE_GROUP, {
    variables: { attributes: { name } },
    update: (cache, { data: { createGroup } }) => {
      const { groups, ...data } = cache.readQuery({ query: GROUPS_Q, variables: { q: null } })
      cache.writeQuery({
        query: GROUPS_Q,
        variables: { q: null },
        data: {
          ...data,
          groups: { ...groups, edges: [{ __typename: 'GroupEdge', node: createGroup }, ...groups.edges] },
        } })
    },
  })

  return (
    <Box gap="small">
      {error && (
        <Box pad="small">
          <GqlError
            error={error}
            header="Could not create group"
          />
        </Box>
      )}
      <InputCollection>
        <ResponsiveInput
          label="name"
          value={name}
          placeholder="short name"
          onChange={({ target: { value } }) => setName(value)}
        />
      </InputCollection>
      <Box
        direction="row"
        justify="end"
      >
        <Button
          label="create"
          onClick={mutation}
          loading={loading}
        />
      </Box>
    </Box>
  )
}

export default function CreateGroup() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        label="Create"
        onClick={() => setOpen(true)}
      />
      {open && (
        <Layer
          modal
          position="center"
          onClickOutside={() => setOpen(false)}
          onEsc={() => setOpen(false)}
        >
          <Box width="30vw">
            <ModalHeader
              text="Create a new group"
              setOpen={setOpen}
            />
            <Box pad="small">
              <GroupForm />
            </Box>
          </Box>
        </Layer>
      )}
    </>
  )
}
