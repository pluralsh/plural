import React, { useCallback, useEffect, useState } from 'react'
import { Box, TextInput, Text } from 'grommet'
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
import { useHistory } from 'react-router'
import { StatusSelector } from './IncidentStatus'


export function IncidentForm({attributes, setAttributes, statusEdit}) {
  const [editorState, setEditorState] = useState(plainDeserialize(attributes.description || ''))
  const editor = useEditor()
  const setDescription = useCallback((editorState) => {
    setEditorState(editorState)
    setAttributes({...attributes, description: plainSerialize(editorState)})
  }, [setAttributes, attributes, setEditorState])

  return (
    <Box gap='small'>
      <Box direction='row' gap='medium'>
        <Box fill='horizontal' direction='row' gap='small' align='center'>
          <Text size='small' weight='bold'>Title</Text>
          <TextInput
            label='title'
            value={attributes.title}
            placeholder='Short Incident Title'
            onChange={({target: {value}}) => setAttributes({...attributes, title: value})} />
          {statusEdit && (
            <StatusSelector
              status={attributes.status}
              setStatus={(status) => setAttributes({...attributes, status})} />
          )}
        </Box>
        <SeveritySelect 
          severity={attributes.severity} 
          setSeverity={(severity) => setAttributes({...attributes, severity})} />
      </Box>
      <Box style={{maxHeight: '80%'}} pad='small' border round='xsmall'>
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

function RepoOption({repo, selected, setRepository}) {
  return (
    <Box direction='row' align='center' gap='small' onClick={() => setRepository(repo)}
          hoverIndicator='light-3' pad='small'>
      <RepoIcon repo={repo} />
      <Box fill='horizontal'>
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

  useEffect(() => {
    if (data && data.installations && !repository) {
      const installation = data.installations.edges[0]
      setRepository(installation && installation.node.repository)
    }
  }, [data, repository, setRepository])
  if (!data || !repository) return null

  return (     
    <Box width='30%' height='100%' style={{overflow: 'scroll'}} flex={false}>
      {data.installations.edges.map(({node: {repository: repo}}) => (
        <RepoOption repo={repo} selected={repository} setRepository={setRepository} />
      ))}
    </Box>
  )
}

export function CreateIncident() {
  let history = useHistory()
  const [repository, setRepository] = useState(null)
  const [attributes, setAttributes] = useState({title: '', description: '', severity: 4})
  const [mutation, {loading}] = useMutation(CREATE_INCIDENT, {
    variables: {repositoryId: repository && repository.id, attributes},
    update: (cache, {data: { createIncident }}) => updateCache(cache, {
      query: INCIDENTS_Q,
      update: (prev) => appendConnection(prev, createIncident, 'Incident', 'incidents')
    }),
    onCompleted: () => history.push('/incidents')
  })

  return (
    <Box fill direction='row' border={{side: 'between', color: 'light-5'}} gap='0px'>
      <RepositorySelect repository={repository} setRepository={setRepository} />
      <Box gap='small' pad='small' fill>
        <IncidentForm attributes={attributes} setAttributes={setAttributes} />
        <Box direction='row' justify='end'>
          <Button loading={loading} label='Create' onClick={mutation} />
        </Box>
      </Box>
    </Box>
  )
}
