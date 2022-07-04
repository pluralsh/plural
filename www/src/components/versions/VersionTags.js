import { useCallback, useState } from 'react'
import { Box, Select, Text } from 'grommet'
import { Button, SecondaryButton } from 'forge-core'
import { useMutation } from '@apollo/client'

import { ModalHeader } from '../ModalHeader'

import { UPDATE_VERSION } from './queries'

export function VersionTag({ tag: { tag }, onClick }) {
  return (
    <Box
      round="xsmall"
      align="center"
      justify="center"
      background="fill-one"
      onClick={onClick}
      pad={{ horizontal: 'small', vertical: 'xxsmall' }}
    >
      <Text size="xsmall">{tag}</Text>
    </Box>
  )
}

export const TAGS = [
  'latest',
  'stable',
  'warm',
]

export function EditTags({ version, setOpen, refetch }) {
  const [value, setValue] = useState('stable')
  const [current, setCurrent] = useState((version.tags || []).map(({ tag }) => ({ tag })))
  const addTag = useCallback(tag => {
    setCurrent([...current, { tag }])
    setValue('')
  }, [current, setCurrent, setValue])
  const removeTag = useCallback(tag => setCurrent(current.filter(c => c.tag !== tag)), [current, setCurrent])
  const [mutation, { loading }] = useMutation(UPDATE_VERSION, {
    variables: { id: version.id, attributes: { tags: current } },
    onCompleted: () => {
      setOpen(false); refetch()
    },
  })

  return (
    <Box width="40vw">
      <ModalHeader
        text="Edit tags"
        setOpen={setOpen}
      />
      <Box
        gap="small"
        pad="medium"
      >
        <Box
          direction="row"
          gap="small"
          align="center"
        >
          <Box
            direction="row"
            gap="xsmall"
            align="center"
          >
            {current.length > 0 ?
              (current.map(tag => (
                <VersionTag
                  key={tag}
                  tag={tag}
                  onClick={() => removeTag(tag.tag)}
                />
              ))) :
              <Text size="small">Add a tag...</Text>}
          </Box>
          <Select
            options={TAGS.filter(name => !current.find(({ tag }) => tag === name))}
            value={value}
            onChange={({ option }) => setValue(option)}
          />
          <SecondaryButton
            label="add"
            onClick={() => addTag(value)}
          />
        </Box>
        <Box
          direction="row"
          align="center"
          justify="end"
        >
          <Button
            label="Update"
            onClick={mutation}
            loading={loading}
          />
        </Box>
      </Box>
    </Box>
  )
}
