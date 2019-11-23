import React, {useState} from 'react'
import {Box, Text, CheckBox} from 'grommet'
import {Alert, Close} from 'grommet-icons'
import {useMutation} from 'react-apollo'
import Button from '../utils/Button'
import {INSTALL_REPO, UPDATE_INSTALLATION, REPO_Q} from './queries'
import {apiHost} from '../../helpers/hostname'
import Editor from '../utils/Editor'
import Pill from '../utils/Pill'
import yaml from 'js-yaml'

function update(cache, repositoryId, installation) {
  const prev = cache.readQuery({ query: REPO_Q, variables: {repositoryId} })
  cache.writeQuery({query: REPO_Q,
    variables: {repositoryId},
    data: {...prev, repository: { ...prev.repository, installation: installation}}
  })
}

function EditInstallation({installation, repository, onUpdate}) {
  const [ctx, setCtx] = useState(yaml.safeDump(installation.context || {}, null, 2))
  const [autoUpgrade, setAutoUpgrade] = useState(installation.autoUpgrade)
  const [notif, setNotif] = useState(false)
  const [mutation, {loading, errors}] = useMutation(UPDATE_INSTALLATION, {
    variables: {id: installation.id, attributes: {context: ctx, autoUpgrade}},
    update: (cache, {data: {updateInstallation}}) => {
      const func = onUpdate || update
      func(cache, repository.id, updateInstallation)
      setNotif(true)
    }
  })

  return (
    <>
    {notif && (
      <Pill background='status-ok' onClose={() => {console.log('wtf'); setNotif(false)}}>
        <Box direction='row' align='center' gap='small'>
          <Text>Configuration saved</Text>
          <Close style={{cursor: 'pointer'}} size='15px' onClick={() => setNotif(false)} />
        </Box>
      </Pill>
    )}
    <Box gap='small' fill='horizontal'>
      <Text size='medium'>Configuration</Text>
      <Box>
        <Editor lang='yaml' value={ctx} onChange={setCtx} />
      </Box>
      {errors && (
        <Box direction='row' gap='small'>
          <Alert size='15px' color='notif' />
          <Text size='small' color='notif'>Must be in json format</Text>
        </Box>)}
      <Box direction='row' justify='end'>
        <CheckBox
          toggle
          label='Auto Upgrade'
          checked={autoUpgrade}
          onChange={(e) => setAutoUpgrade(e.target.checked)}
        />
      </Box>
      <Box direction='row' justify='end'>
        <Button
          pad={{horizontal: 'medium', vertical: 'xsmall'}}
          loading={loading}
          label='Save'
          onClick={mutation}
          round='xsmall' />
      </Box>
    </Box>
    </>
  )
}


function Installation({repository, onUpdate, noHelm}) {
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
      {repository.installation ?
        <Box gap='small'>
          {!noHelm && (
            <>
            <Text size='medium'>Installation</Text>
            <Box background='light-3' pad='small'>
              <Text size='small'>helm repo add {repository.name} cm://{apiHost()}/cm/{repository.name}</Text>
            </Box>
            </>
          )}
          <EditInstallation installation={repository.installation} repository={repository} onUpdate={onUpdate} />
        </Box> :
        <Button label='Install Repository' round='xsmall' onClick={mutation} />
      }
    </Box>
  )
}

export default Installation