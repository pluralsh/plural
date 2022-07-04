import { useCallback, useContext, useEffect, useState } from 'react'
import { Box, Text, TextInput } from 'grommet'
import { Button, Check as Checkmark, SecondaryButton } from 'forge-core'
import { Editable, Slate } from 'slate-react'

import { useMutation, useQuery } from '@apollo/client'

import { useEditor } from '../utils/hooks'
import { plainDeserialize, plainSerialize } from '../../utils/slate'

import { INSTALLATIONS_Q } from '../repos/queries'
import { RepoIcon } from '../repos/Repositories'

import { appendConnection, updateCache } from '../../utils/graphql'

import { TagInput } from '../repos/Tags'

import { CREATE_INCIDENT, INCIDENTS_Q } from './queries'

import { StatusSelector } from './IncidentStatus'

import { SeveritySelect } from './Severity'

import { IncidentContext } from './context'
import { IncidentViewContext } from './Incidents'

export function IncidentForm({ attributes, setAttributes, statusEdit, children }) {
  const [editorState, setEditorState] = useState(plainDeserialize(attributes.description || ''))
  const editor = useEditor()
  const setDescription = useCallback(editorState => {
    setEditorState(editorState)
    setAttributes({ ...attributes, description: plainSerialize(editorState) })
  }, [setAttributes, attributes, setEditorState])

  return (
    <Box gap="small">
      <Box
        direction="row"
        gap="medium"
      >
        <Box
          fill="horizontal"
          direction="row"
          gap="small"
          align="center"
        >
          <Text
            size="small"
            weight="bold"
          >Title
          </Text>
          <TextInput
            label="title"
            value={attributes.title}
            placeholder="Short Incident Title"
            onChange={({ target: { value } }) => setAttributes({ ...attributes, title: value })}
          />
          {statusEdit && (
            <StatusSelector
              status={attributes.status}
              setStatus={status => setAttributes({ ...attributes, status })}
            />
          )}
        </Box>
        <SeveritySelect
          severity={attributes.severity}
          setSeverity={severity => setAttributes({ ...attributes, severity })}
        />
      </Box>
      <Box
        style={{ maxHeight: '80%', minHeight: '30vh' }}
        pad="small"
        border={{ color: 'border' }}
        round="xsmall"
      >
        <Slate
          editor={editor}
          value={editorState}
          onChange={setDescription}
        >
          <Editable
            style={{ minHeight: '30vh' }}
            placeholder="Description of the incident (markdown allowed)"
          />
        </Slate>
      </Box>
      <Box
        direction="row"
        gap="small"
        align="center"
      >
        <TagInput
          tags={attributes.tags || []}
          addTag={tag => setAttributes({ ...attributes, tags: [tag, ...(attributes.tags || [])] })}
          removeTag={tag => setAttributes({ ...attributes, tags: attributes.tags.filter(t => t !== tag) })}
        />
        {children}
      </Box>
    </Box>
  )
}

export function RepoOption({ repo, selected, setRepository }) {
  return (
    <Box
      flex={false}
      direction="row"
      align="center"
      gap="small"
      onClick={() => setRepository(repo)}
      hoverIndicator="light-3"
      pad="small"
      focusIndicator={false}
    >
      <RepoIcon repo={repo} />
      <Box fill="horizontal">
        <Text
          size="small"
          weight={500}
        >{repo.name}
        </Text>
        <Text size="small"><i>{repo.description}</i></Text>
      </Box>
      {selected && selected.id === repo.id && (
        <Checkmark
          size="15px"
          color="brand"
        />
      )}
    </Box>
  )
}

export function RepositorySelect({ repository, setRepository }) {
  const { data } = useQuery(INSTALLATIONS_Q, { fetchPolicy: 'cache-and-network' })

  useEffect(() => {
    if (data && data.installations && !repository) {
      const installation = data.installations.edges[0]
      setRepository(installation && installation.node.repository)
    }
  }, [data, repository, setRepository])
  if (!data || !repository) return null

  return (
    <Box
      width="30%"
      style={{ overflow: 'scroll', maxHeight: '60vh' }}
      flex={false}
    >
      {data.installations.edges.map(({ node: { repository: repo } }) => (
        <RepoOption
          repo={repo}
          selected={repository}
          setRepository={setRepository}
        />
      ))}
    </Box>
  )
}

export function CreateIncident({ onCompleted }) {
  const { clusterInformation } = useContext(IncidentContext)
  const { sort, order, filters } = useContext(IncidentViewContext)
  const [repository, setRepository] = useState(null)
  const [attributes, setAttributes] = useState({ title: '', description: '', severity: 4, tags: [] })
  const [mutation, { loading }] = useMutation(CREATE_INCIDENT, {
    variables: {
      repositoryId: repository && repository.id,
      attributes: { ...attributes, tags: attributes.tags.map(t => ({ tag: t })), clusterInformation },
    },
    update: (cache, { data: { createIncident } }) => updateCache(cache, {
      query: INCIDENTS_Q,
      variables: { q: null, filters, order, sort },
      update: prev => appendConnection(prev, createIncident, 'incidents'),
    }),
    onCompleted,
  })

  return (
    <Box
      flex={false}
      border={{ side: 'bottom', color: 'border' }}
    >
      <Box
        animation="fadeIn"
        flex={false}
        direction="row"
        border={{ side: 'between', color: 'border' }}
        gap="none"
      >
        <RepositorySelect
          repository={repository}
          setRepository={setRepository}
        />
        <Box
          gap="small"
          pad="small"
          fill
        >
          <IncidentForm
            attributes={attributes}
            setAttributes={setAttributes}
          >
            <Box
              flex={false}
              direction="row"
              justify="end"
              gap="small"
            >
              <SecondaryButton
                label="Cancel"
                onClick={onCompleted}
              />
              <Button
                loading={loading}
                label="Create"
                onClick={mutation}
              />
            </Box>
          </IncidentForm>
        </Box>
      </Box>
    </Box>
  )
}
