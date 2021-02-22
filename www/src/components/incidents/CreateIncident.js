import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Drop, TextInput, Text } from 'grommet'
import { Button } from 'forge-core'
import { Slate, Editable } from 'slate-react'
import { useEditor } from '../utils/hooks'
import { plainDeserialize, plainSerialize } from '../../utils/slate'
import { SeveritySelect } from './Severity'
import { useMutation, useQuery } from 'react-apollo'
import { INSTALLATIONS_Q } from '../repos/queries'
import { RepoIcon } from '../repos/Repositories'
import { Checkmark } from 'grommet-icons'
import { CREATE_INCIDENT, INCIDENTS_Q } from './queries'
import { appendConnection, updateCache } from '../../utils/graphql'


export function IncidentForm({attributes, setAttributes}) {
  const [editorState, setEditorState] = useState(plainDeserialize(attributes.description || ''))
  const editor = useEditor()
  const setDescription = useCallback((editorState) => {
    setEditorState(editorState)
    setAttributes({...attributes, description: plainSerialize(editorState)})
  }, [setAttributes, attributes, setEditorState])

  return (
    <Box gap='small'>
      <Box direction='row' gap='medium'>
        <Box fill='horizontal'>
          <TextInput
            label='title'
            value={attributes.title}
            placeholder='Short Incident Title'
            onChange={({target: {value}}) => setAttributes({...attributes, title: value})} />
        </Box>
        <SeveritySelect 
          severity={attributes.severity} 
          setSeverity={(severity) => setAttributes({...attributes, severity})} />
      </Box>
      <Box style={{minHeight: '150px'}} pad='small' border round='xsmall'>
        <Slate
          editor={editor}
          value={editorState}
          onChange={setDescription}>
          <Editable placeholder='Description of the incident (markdown allowed)' />
        </Slate>
      </Box>
    </Box>
  )
}

function RepoOption({repo, selected}) {
  return (
    <Box direction='row' align='center' gap='small'>
      <RepoIcon repo={repo} />
      <Box>
        <Text size='small' weight={500}>{repo.name}</Text>
        <Text size='small'><i>{repo.description}</i></Text>
      </Box>
      {selected.id === repo.id && (
        <Checkmark size='15px' color='brand' />
      )}
    </Box>
  )
}

export function RepositorySelect({repository, setRepository}) {
  const {data} = useQuery(INSTALLATIONS_Q, {fetchPolicy: "cache-and-network"})
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    if (data && data.edges && !repository) {
      const installation = data.installations.edges[0]
      setRepository(installation && installation.repository)
    }
  }, [data, repository, setRepository])
  if (!data || !repository) return null

  return (
    <>
      <Box ref={ref} onClick={() => setOpen(true)} direction='row' gap='xsmall' align='center'>
        <RepoIcon repo={repository} />
        <Text size='small' weight={500}>{repository.name}</Text>
      </Box>
      {open && (
        <Drop align={{top: 'bottom'}} target={ref.current}>
          <Box width='200px'>
            {data.installations.edges.map(({node: {repository: repo}}) => (
              <RepoOption repo={repo} selected={repository} />
            ))}
          </Box>
        </Drop>
      )}
    </>
  )
}

export function CreateIncident({repositoryId}) {
  const [attributes, setAttributes] = useState({title: '', description: '', severity: 4})
  const [mutation, {loading}] = useMutation(CREATE_INCIDENT, {
    variables: {repositoryId, attributes},
    update: (cache, {data: { createIncident }}) => updateCache(cache, {
      query: INCIDENTS_Q,
      update: (prev) => appendConnection(prev, createIncident, 'Incident', 'incidents')
    })
  })

  return (
    <Box gap='small'>
      <IncidentForm attributes={attributes} setAttributes={setAttributes} />
      <Box direction='row' justify='end'>
        <Button loading={loading} label='Create' onClick={mutation} />
      </Box>
    </Box>
  )
}
