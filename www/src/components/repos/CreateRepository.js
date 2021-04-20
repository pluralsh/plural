import React, { useState } from 'react'
import { Box, CheckBox, Text, TextInput } from 'grommet'
import { DocumentImage } from 'grommet-icons'
import { useMutation } from 'react-apollo'
import { Button, SecondaryButton } from 'forge-core'
import { FilePicker } from 'react-file-picker'
import { CREATE_REPO, REPOS_Q } from './queries'
import { generatePreview } from '../../utils/file'
import { TagInput } from './Tags'
import { appendConnection, updateCache } from '../../utils/graphql'
import { useHistory } from 'react-router'

const LABEL_WIDTH = '90px'

export function LabeledInput({label, children}) {
  return (
    <Box gap='xsmall'>
      <Text size='small' weight='bold'>{label}</Text>
      {children}
    </Box>
  )
}

export function RepoForm({image, setImage, state, setState, label, mutation, loading, update}) {
  return (
    <Box pad='medium' gap='medium'>
      <LabeledInput label='1. Upload an image'>
      <Box direction='row' gap='small' align='center'>
        <Box width='70px' height='70px' border pad='xsmall'
          align='center' justify='center'>
          {image ? <img alt='' width='50px' height='50px' src={image.previewUrl} /> :
            <DocumentImage size='20px' />
          }
        </Box>
        <Box gap='xsmall'>
          <Text size='small'>{image ? image.file.name : 'Select an image'}</Text>
          <FilePicker
            extensions={['jpg', 'jpeg', 'png']}
            dims={{minWidth: 100, maxWidth: 500, minHeight: 100, maxHeight: 500}}
            onChange={(file) => generatePreview(file, setImage)}
            onError={console.log}
          >
            <SecondaryButton round='xsmall' label='Upload an icon' />
          </FilePicker>
        </Box>
      </Box>
      </LabeledInput>
      <LabeledInput label='2. Give it a name'>
        <TextInput
          labelWidth={LABEL_WIDTH}
          placeholder='a good name'
          value={state.name}
          onChange={(e) => setState({...state, name: e.target.value})} />
      </LabeledInput>
      <LabeledInput label='3. Give it a quick description'>
        <TextInput
          label='description'
          labelWidth={LABEL_WIDTH}
          placeholder='a helpful description'
          value={state.description}
          onChange={(e) => setState({...state, description: e.target.value})} />
      </LabeledInput>
      <LabeledInput label='4. Add tags as needed'>
        <TagInput
          tags={state.tags || []}
          addTag={(tag) => setState({...state, tags: [tag, ...(state.tags || [])]})}
          removeTag={(tag) => setState({...state, tags: state.tags.filter((t) => t !== tag)})} />
      </LabeledInput>
      <Box direction='row' justify='end' align='center' gap='small'>
        <CheckBox
          toggle
          label={state.private ? 'private' : 'public'}
          checked={state.private}
          onChange={({target: {checked}}) => setState({...state, private: !!checked})} />
        <Button loading={loading} round='xsmall' label={update ? 'Update' : 'Create'} onClick={mutation} />
      </Box>
    </Box>
  )
}

export default function CreateRepository({publisher}) {
  let history = useHistory()
  const [state, setState] = useState({name: "", description: "", tags: [], private: false})
  const [image, setImage] = useState(null)
  const attributes = {...state, tags: state.tags.map((t) => ({tag: t}))}
  const [mutation, {loading}] = useMutation(CREATE_REPO, {
    variables: {attributes: {...attributes, icon: image && image.file}},
    update: (cache, { data: { createRepository } }) => updateCache(cache, {
      query: REPOS_Q, 
      variables: {publisherId: publisher.id},
      update: (prev) => appendConnection(prev, createRepository, 'repositories')
    }),
    onCompleted: () => history.push('/publishers/mine/repos')
  })

  return (
    <RepoForm
      label='Create a new repository'
      image={image}
      setImage={setImage}
      state={state}
      setState={setState}
      mutation={mutation}
      loading={loading} />
  )
}