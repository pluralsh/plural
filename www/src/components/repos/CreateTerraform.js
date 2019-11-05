import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Archive} from 'grommet-icons'
import {useMutation} from 'react-apollo'
import InputField from '../utils/InputField'
import Button, {SecondaryButton} from '../utils/Button'
import {FilePicker} from 'react-file-picker'
import {CREATE_TF, REPO_Q} from './queries'
import {generatePreview} from '../../utils/file'
import {DEFAULT_TF_ICON} from './constants'

const LABEL_WIDTH = '90px'

export function TerraformForm({label, update, loading, mutation, state, setState, terraform, setTerraform}) {
  return (
    <Box gap='small'>
      <Text>{label}</Text>
      <Box direction='row' gap='small' align='center'>
        {terraform ?
          <img alt='' width='70px' height='70px' src={DEFAULT_TF_ICON} /> :
          <Box
            width='70px'
            height='70px'
            background='light-2'
            border
            pad='xsmall'
            align='center'
            justify='center'>
            <Archive size='20px' />
          </Box>}
        <Box gap='xsmall'>
          <Text size='small'>{terraform ? terraform.file.name : 'Select a terraform module'}</Text>
          <FilePicker
            extensions={['tgz']}
            onChange={(file) => generatePreview(file, setTerraform)}>
            <SecondaryButton round='xsmall' label='Upload a tar' />
          </FilePicker>
        </Box>
      </Box>
      <InputField
        label='name'
        labelWidth={LABEL_WIDTH}
        placeholder='give it a  name'
        value={state.name}
        onChange={(e) => setState({...state, name: e.target.value})} />
      <InputField
        label='description'
        labelWidth={LABEL_WIDTH}
        placeholder='a helpful description'
        value={state.description}
        onChange={(e) => setState({...state, description: e.target.value})} />
      <Box direction='row' justify='end'>
        <Button loading={loading} round='xsmall' label={update ? 'Update' : 'Create'} onClick={mutation} />
      </Box>
    </Box>
  )
}

function CreateTerraform({repositoryId, query, vars}) {
  const [state, setState] = useState({name: "", description: ""})
  const [terraform, setTerraform] = useState(null)
  const [mutation, {loading}] = useMutation(query || CREATE_TF, {
    variables: {repositoryId, attributes: {...state, package: terraform && terraform.file}},
    update: (cache, { data: {createTerraform} }) => {
      const prev = cache.readQuery({query: REPO_Q, variables: {repositoryId}})
      cache.writeQuery({query: REPO_Q, variables: {repositoryId}, data: {
        ...prev,
        terraform: {
          ...prev.terraform,
          edges: [{__typename: 'TerraformEdge', node: createTerraform}, ...prev.terraform.edges]
        }
      }})
    }
  })

  return (
    <TerraformForm
      state={state}
      setState={setState}
      terraform={terraform}
      setTerraform={setTerraform}
      mutation={mutation}
      loading={loading}
      label='Create a new Terraform Module' />
  )
}

export default CreateTerraform