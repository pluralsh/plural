import React, { useState } from 'react'
import { useMutation } from 'react-apollo'
import { Button, Pill } from 'forge-core'
import { Box, CheckBox, Select, Text } from 'grommet'
import { Alert, Close } from 'grommet-icons'
import AceEditor from "react-ace"
import yaml from 'js-yaml'
import { REPO_Q, UPDATE_INSTALLATION } from './queries'
import { TAGS } from '../versions/VersionTags'
import "ace-builds/src-noconflict/mode-yaml"
import "ace-builds/src-noconflict/theme-terminal"

function update(cache, repositoryId, installation) {
  const prev = cache.readQuery({ query: REPO_Q, variables: {repositoryId} })
  cache.writeQuery({query: REPO_Q,
    variables: {repositoryId},
    data: {...prev, repository: { ...prev.repository, installation: installation}}
  })
}

export function EditInstallation({installation, repository, onUpdate}) {
  const [ctx, setCtx] = useState(yaml.safeDump(installation.context || {}, null, 2))
  const [autoUpgrade, setAutoUpgrade] = useState(installation.autoUpgrade)
  const [trackTag, setTrackTag] = useState(installation.trackTag)
  const [notif, setNotif] = useState(false)
  const [mutation, {loading, errors}] = useMutation(UPDATE_INSTALLATION, {
    variables: {id: installation.id, attributes: {context: ctx, autoUpgrade, trackTag}},
    update: (cache, {data: {updateInstallation}}) => {
      (onUpdate || update)(cache, repository.id, updateInstallation)
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
    <Box gap='small' fill='horizontal' pad='small'>
      <Box>
        <AceEditor
          mode='yaml'
          theme='terminal'
          height='300px'
          width='100%'
          name='Configuration'
          value={ctx}
          showGutter
          showPrintMargin
          highlightActiveLine
          editorProps={{ $blockScrolling: true }}
          onChange={setCtx} />
      </Box>
      {errors && (
        <Box direction='row' gap='small'>
          <Alert size='15px' color='notif' />
          <Text size='small' color='notif'>Must be in json format</Text>
        </Box>)}
      <Box direction='row' justify='end' gap='small' align='center'>
        <CheckBox
          toggle
          label='Auto Upgrade'
          checked={autoUpgrade}
          onChange={(e) => setAutoUpgrade(e.target.checked)}
        />
        {autoUpgrade && (
          <Select
            value={trackTag}
            options={TAGS}
            onChange={({option}) => setTrackTag(option)} />
        )}
      </Box>
      <Box pad='small' direction='row' justify='end'>
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