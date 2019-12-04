import React, {useState} from 'react'
import {useMutation} from 'react-apollo'
import {Box} from 'grommet'
import InputField from '../utils/InputField'
import Button from '../utils/Button'
import { CREATE_PUBLISHER } from './queries'
import { ME_Q } from '../users/queries'

export default function CreatePublisher({onCreate}) {
  const [attributes, setAttributes] = useState({description: '', name: ''})
  const [mutation] = useMutation(CREATE_PUBLISHER, {
    variables: {attributes},
    update: (cache, { data: { createPublisher } }) => {
      const prev = cache.readQuery({ query: ME_Q })
      cache.writeQuery({query: ME_Q, data: {
        ...prev, me: {
          ...prev.me,
          publisher: createPublisher
        }
      }})
      onCreate && onCreate()
    }
  })

  return (
    <Box gap='small' pad='small'>
      <InputField
        label='name'
        labelWidth='95px'
        placeholder='a name'
        value={attributes.name}
        onChange={(e) => setAttributes({...attributes, name: e.target.value})} />
      <InputField
        label='description'
        labelWidth='95px'
        placeholder='a description of what you do'
        value={attributes.description}
        onChange={(e) => setAttributes({...attributes, description: e.target.value})} />
      <Box direction='row' justify='end'>
        <Button round='xsmall' label='Update' onClick={mutation} />
      </Box>
    </Box>
  )
}