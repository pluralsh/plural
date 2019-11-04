import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Archive} from 'grommet-icons'
import {useMutation} from 'react-apollo'
import InputField from '../utils/InputField'
import Button, {SecondaryButton} from '../utils/Button'
import {FilePicker} from 'react-file-picker'
import {CREATE_TF, REPO_Q} from './queries'

const LABEL_WIDTH = '90px'

function CreateTerraform({repositoryId}) {
  const [state, setState] = useState({name: "", description: ""})
  const [terraform, setTerraform] = useState(null)
  const [mutation, {loading}] = useMutation(CREATE_TF, {
    variables: {attributes: {...state, package: terraform}},
    update: (cache, { data: { createTerraform } }) => {
      const prev = cache.readQuery({ query: REPO_Q, variables: {repositoryId} })
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
    <Box pad='medium' gap='small'>
      <Text>Create a new Terraform Module</Text>
      <Box direction='row' gap='small' align='center'>
        <Box
          width='70px'
          height='70px'
          background='light-2'
          border
          pad='xsmall'
          align='center'
          justify='center'>
          <Archive size='20px' />
        </Box>
        <Box gap='xsmall'>
          <Text size='small'>{terraform ? terraform.name : 'Select an terraform'}</Text>
          <FilePicker
            extensions={['jpg', 'jpeg', 'png']}
            dims={{minWidth: 100, maxWidth: 500, minHeight: 100, maxHeight: 500}}
            onChange={setTerraform}
          >
            <SecondaryButton round='xsmall' label='Upload an icon' />
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
        <Button loading={loading} round='xsmall' label='Create' onClick={mutation} />
      </Box>
    </Box>
  )
}

export default CreateTerraform