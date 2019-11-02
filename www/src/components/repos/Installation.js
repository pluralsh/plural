import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Alert} from 'grommet-icons'
import {useMutation} from 'react-apollo'
import Button from '../utils/Button'
import {INSTALL_REPO, UPDATE_INSTALLATION, REPO_Q} from './queries'
import {apiHost} from '../../helpers/hostname'
import Editor from '../utils/Editor'

function EditInstallation({installation, repository}) {
  const [ctx, setCtx] = useState(JSON.stringify(installation.context || {}))
  const [mutation, {errors}] = useMutation(UPDATE_INSTALLATION, {
    variables: {id: installation.id, attributes: {context: ctx}},
    update: (cache, {data: {updateInstallation}}) => {
      const prev = cache.readQuery({ query: REPO_Q, variables: {repositoryId: repository.id} })
      cache.writeQuery({query: REPO_Q,
        variables: {repositoryId: repository.id},
        data: {...prev, repository: { ...prev.repository, installation: updateInstallation}}
      })
    }
  })

  return (
    <Box gap='xsmall' fill='horizontal'>
      <Text size='medium'>Configuration</Text>
      <Box height='330px'>
        <Editor value={ctx} onChange={setCtx} />
      </Box>
      {errors && (
        <Box direction='row' gap='small'>
          <Alert size='15px' color='notif' />
          <Text size='small' color='notif'>Must be in json format</Text>
        </Box>)}
      <Box direction='row' justify='end'>
        <Button label='save' onClick={mutation} round='xsmall' width='70px' />
      </Box>
    </Box>
  )
}


function Installation({repository}) {
  const [mutation] = useMutation(INSTALL_REPO, {
    variables: {repositoryId: repository.id},
    update: (cache, { data: { createInstallation } }) => {
      const prev = cache.readQuery({ query: REPO_Q, variables: {repositoryId: repository.id} })
      cache.writeQuery({query: REPO_Q,
        variables: {repositoryId: repository.id},
        data: {...prev, repository: { ...prev.repository, installation: createInstallation}}
      })
    }
  })

  return (
    <Box pad='small' elevation='small' gap='small'>
      <Text size='medium'>Installation</Text>
      {repository.installation ?
        <Box gap='small'>
          <Box background='light-3' pad='small'>
            <Text size='small'>helm repo add {repository.name} cm://{apiHost()}/{repository.name}</Text>
          </Box>
          <EditInstallation installation={repository.installation} repository={repository} />
        </Box> :
        <Button label='Install Repository' round='xsmall' onClick={mutation} />
      }
    </Box>
  )
}

export default Installation