import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Button, Close, Edit, File, Messages as MessagesI, Scroller } from 'forge-core'
import { Editable, Slate } from 'slate-react'
import { useMutation, useQuery, useSubscription } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Layer, Text, TextInput } from 'grommet'
import moment from 'moment'

import { ModalHeader } from '../ModalHeader'
import { dateFormat } from '../../utils/date'
import SmoothScroller from '../utils/SmoothScroller'
import { extendConnection } from '../../utils/graphql'
import { plainDeserialize, plainSerialize } from '../../utils/slate'
import { useEditor } from '../utils/hooks'

import { TagInput } from '../repos/Tags'
import { CurrentUserContext } from '../login/CurrentUser'
import { BreadcrumbsContext } from '../Breadcrumbs'
import Avatar from '../users/Avatar'

import Markdown from './Markdown'
import { DELETE_INCIDENT, INCIDENT_Q, INCIDENT_SUB, MESSAGE_SUB, UPDATE_INCIDENT } from './queries'
import { Severity } from './Severity'
import { Status } from './IncidentStatus'
import { MessageInput, MessageScrollContext } from './MessageInput'

import { Message } from './Message'

import { AttachmentProvider, Dropzone } from './AttachmentProvider'
import { IncidentView } from './types'
import { FileEntry } from './File'
import { ViewSwitcher } from './ViewSwitcher'
import { Sidebar } from './Sidebar'
import { IncidentControls } from './IncidentControls'

import { Postmortem } from './Postmortem'
import { applyMessages } from './applicators'
import { LastMessage } from './LastMessage'
import { PresenceProvider } from './Presence'
import { SlaTimer } from './SlaTimer'

export const canEdit = ({ creator, owner }, { id }) => (creator || {}).id === id || (owner || {}).id === id

function EditButton({ editing, setEditing }) {
  return (
    <Box
      pad="xsmall"
      round="xsmall"
      hoverIndicator="light-3"
      focusIndicator={false}
      onClick={() => setEditing(!editing)}
    >
      {editing ? (
        <Close
          size="small"
          color="dark-6"
        />
      ) : (
        <Edit
          size="small"
          color="dark-6"
        />
      )}
    </Box>
  )
}

function Empty() {
  return (
    <Box
      fill
      pad="medium"
      gap="small"
      align="center"
      justify="center"
      round="xsmall"
    >
      <MessagesI size="40px" />
      <Text size="small">Get the conversation started</Text>
    </Box>
  )
}

function DeleteIncident({ incident }) {
  const [mutation, { loading }] = useMutation(DELETE_INCIDENT, { variables: { id: incident.id } })

  return (
    <Button
      label="Delete"
      background="red-dark"
      onClick={mutation}
      loading={loading}
    />
  )
}

function IncidentHeader({ incident, editable, editing, setEditing, mutation, attributes, setAttributes, updating }) {
  const [editorState, setEditorState] = useState(plainDeserialize(incident.description || ''))
  const editor = useEditor()
  const setDescription = useCallback(editorState => {
    setEditorState(editorState)
    setAttributes({ ...attributes, description: plainSerialize(editorState) })
  }, [setAttributes, attributes, setEditorState])

  return (
    <Box
      flex={false}
      border={{ color: 'light-4' }}
    >
      <Box
        direction="row"
        align="center"
        background="light-1"
        pad={{ vertical: 'xsmall', horizontal: 'small' }}
        border={{ side: 'bottom', color: 'border' }}
        gap="xsmall"
        round={{ corner: 'top', size: 'xsmall' }}
      >
        <Box
          fill="horizontal"
          direction="row"
          gap="xsmall"
        >
          <Text
            size="small"
            weight="bold"
          >{incident.creator.name}
          </Text>
          <Text size="small">created on {dateFormat(moment(incident.insertedAt))}</Text>
        </Box>
        {!editing && <IncidentControls incident={incident} />}
        {editing && (
          <Box flex={false}>
            <Button
              label="Update"
              loading={updating}
              pad={{ vertical: 'xsmall', horizontal: 'small' }}
              onClick={() => mutation({
                variables: { attributes: { ...attributes, tags: attributes.tags.map(tag => ({ tag })) } },
                update: () => setEditing(false),
              })}
            />
          </Box>
        )}
        {editable && (
          <EditButton
            incidentId={incident.id}
            editing={editing}
            setEditing={setEditing}
          />
        )}
      </Box>
      {!editing && (
        <Box
          flex={false}
          gap="xsmall"
          border={{ side: 'between', color: 'border' }}
        >
          <Box pad="small">
            <Markdown text={incident.description || ''} />
          </Box>
          {incident.tags.length > 0 && (
            <Box
              direction="row"
              gap="xsmall"
              align="center"
              pad={{ horizontal: 'small', vertical: 'xsmall' }}
            >
              {incident.tags.map(({ tag }) => (
                <Box
                  key={tag}
                  flex={false}
                  round="xsmall"
                  pad={{ vertical: '1px', horizontal: 'xsmall' }}
                  background="light-3"
                >
                  <Text size="xsmall">{tag}</Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
      {editing && (
        <Box
          flex={false}
          gap="xsmall"
          border={{ side: 'between', color: 'border' }}
        >
          <Box pad="small">
            <Slate
              editor={editor}
              value={editorState}
              onChange={setDescription}
            >
              <Editable placeholder="Description of the incident (markdown allowed)" />
            </Slate>
          </Box>
          <Box
            direction="row"
            gap="small"
            align="center"
            pad="small"
          >
            <TagInput
              tags={attributes.tags || []}
              addTag={tag => setAttributes({ ...attributes, tags: [tag, ...(attributes.tags || [])] })}
              removeTag={tag => setAttributes({ ...attributes, tags: attributes.tags.filter(t => t !== tag) })}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}

export function Messages({ incident, loading, fetchMore, subscribeToMore }) {
  const { setListRef, listRef } = useContext(MessageScrollContext)
  const { messages: { pageInfo: { hasNextPage, endCursor }, edges } } = incident

  useEffect(() => subscribeToMore({
    document: MESSAGE_SUB,
    variables: { id: incident.id },
    updateQuery: (prev, { subscriptionData: { data } }) => applyMessages(prev, data),
  }), [incident.id, subscribeToMore])

  if (edges.length === 0) return <Empty />

  return (
    <SmoothScroller
      listRef={listRef}
      setListRef={setListRef}
      items={[...edges, 'end']}
      mapper={(e, { next, prev }, props) => (
        e === 'end' ? <LastMessage date={prev.node.insertedAt} /> : (
          <Message
            message={e.node}
            next={next.node}
            prev={prev.node}
            {...props}
          />
        )
      )}
      loading={loading}
      loadNextPage={() => hasNextPage && fetchMore({
        variables: { cursor: endCursor },
        updateQuery: (prev, { fetchMoreResult: { incident: { messages } } }) => ({
          ...prev, incident: extendConnection(prev.incident, messages, 'messages'),
        }),
      })}
      hasNextPage={hasNextPage}
    />
  )
}

function NoFiles() {
  return (
    <Box
      fill
      pad="medium"
      gap="small"
      align="center"
      justify="center"
      round="xsmall"
    >
      <File size="40px" />
      <Text size="small">No files uploaded yet</Text>
    </Box>
  )
}

function Files({ incident, fetchMore }) {
  const { files: { pageInfo: { hasNextPage, endCursor }, edges } } = incident

  return (
    <Box fill>
      <Scroller
        id="files"
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
        edges={edges}
        emptyState={<NoFiles />}
        mapper={({ node }, { node: next }) => (
          <FileEntry
            file={node}
            next={next}
          />
        )}
        onLoadMore={() => hasNextPage && fetchMore({
          variables: { fileCursor: endCursor },
          updateQuery: (prev, { fetchMoreResult: { incident: { files } } }) => ({
            ...prev, incident: extendConnection(prev.incident, files, 'files'),
          }),
        })}
      />
    </Box>
  )
}

function IncidentOwner({ incident: { owner } }) {
  return (
    <Box
      flex={false}
      direction="row"
      align="center"
      gap="xsmall"
    >
      <Text size="small">Owner: </Text>
      <Avatar
        user={owner}
        size="30px"
      />
      <Text
        size="small"
        color="dark-3"
      >{owner.email}
      </Text>
    </Box>
  )
}

const canDelete = (incident, me) => (
  me.id === incident.creator.id || (incident.owner && incident.owner.id === me.id)
)

function IncidentInner({ incident, fetchMore, subscribeToMore, loading, editing, setEditing }) {
  const [view, setView] = useState(IncidentView.MSGS)
  const [listRef, setListRef] = useState(null)
  const currentUser = useContext(CurrentUserContext)
  const editable = canEdit(incident, currentUser)
  const [attributes, setAttributes] = useState({
    description: incident.description,
    title: incident.title,
    tags: incident.tags.map(({ tag }) => tag),
  })
  const [mutation, { loading: updating }] = useMutation(UPDATE_INCIDENT, {
    variables: { id: incident.id, attributes: { ...attributes, tags: attributes.tags.map(tag => ({ tag })) } },
    onCompleted: () => setEditing(false),
  })

  const refreshList = useCallback(() => {
    if (listRef) listRef.resetAfterIndex(0, true)
  }, [listRef])

  const returnToBeginning = useCallback(() => {
    listRef.scrollToItem(0)
  }, [listRef])

  const value = useMemo(() => ({ listRef, setListRef, refreshList, returnToBeginning }), [listRef, setListRef, refreshList, returnToBeginning])

  return (
    <MessageScrollContext.Provider value={value}>
      <Box fill>
        <AttachmentProvider>
          <Box
            flex={false}
            pad="small"
            direction="row"
            align="center"
            gap="small"
            border={{ side: 'bottom', color: 'border' }}
          >
            <Severity
              incident={incident}
              setSeverity={severity => mutation({ variables: { attributes: { severity } } })}
            />
            {!editing && (
              <Box
                fill="horizontal"
                direction="row"
                align="center"
                gap="xsmall"
              >
                <Text weight={500}>{incident.title}</Text>
              </Box>
            )}
            {editing && (
              <Box
                fill="horizontal"
                direction="row"
                gap="small"
                align="center"
              >
                <TextInput
                  value={attributes.title}
                  onChange={({ target: { value } }) => setAttributes({ ...attributes, title: value })}
                />
              </Box>
            )}
            {incident.owner && (<IncidentOwner incident={incident} />)}
            {incident.nextResponseAt && <SlaTimer incident={incident} />}
            <Status
              incident={incident}
              setActive={status => mutation({ variables: { attributes: { status } } })}
            />
            {canDelete(incident, currentUser) && <DeleteIncident incident={incident} />}
          </Box>
          <Box
            fill
            direction="row"
          >
            <Box fill>
              <Box
                flex={false}
                pad={{ horizontal: 'small' }}
                margin={{ top: 'small' }}
              >
                <IncidentHeader
                  attributes={attributes}
                  setAttributes={setAttributes}
                  incident={incident}
                  editable={editable}
                  editing={editing}
                  setEditing={setEditing}
                  updating={updating}
                  mutation={mutation}
                />
              </Box>
              <Box
                fill
                direction="row"
              >
                <ViewSwitcher
                  incident={incident}
                  view={view}
                  setView={setView}
                />
                <Box fill>
                  {view === IncidentView.POST && <Postmortem incident={incident} />}
                  {view === IncidentView.FILES && (
                    <Files
                      incident={incident}
                      fetchMore={fetchMore}
                    />
                  )}
                  {view === IncidentView.MSGS && (
                    <Dropzone>
                      <Messages
                        updating={updating}
                        editing={editing}
                        mutation={mutation}
                        incident={incident}
                        fetchMore={fetchMore}
                        subscribeToMore={subscribeToMore}
                        loading={loading}
                      />
                    </Dropzone>
                  )}
                </Box>
              </Box>
              <MessageInput />
            </Box>
            <Sidebar
              incident={incident}
              fetchMore={fetchMore}
            />
          </Box>
        </AttachmentProvider>
      </Box>
    </MessageScrollContext.Provider>
  )
}

export function Incident({ editing }) {
  const navigate = useNavigate()
  const [deleted, setDeleted] = useState(false)
  const { incidentId } = useParams()
  const [edit, setEdit] = useState(editing)
  const { data, loading, fetchMore, subscribeToMore } = useQuery(INCIDENT_Q, {
    variables: { id: incidentId },
    fetchPolicy: 'cache-and-network',
  })

  useSubscription(INCIDENT_SUB, {
    variables: { id: incidentId },
    onSubscriptionData: ({ subscriptionData: { data: { incidentDelta: { delta } } } }) => (
      delta === 'DELETE' && setDeleted(true)
    ),
  })

  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([{ url: '/incidents', text: 'incidents' }, { url: `/incidents/${incidentId}`, text: incidentId }])
  }, [setBreadcrumbs, incidentId])

  if (!data) return null

  return (
    <PresenceProvider incidentId={incidentId}>
      {deleted && (
        <Layer modal>
          <Box width="50vw">
            <ModalHeader text="Incident Deleted!" />
            <Box
              pad="medium"
              gap="small"
            >
              <Text size="small">This incident was deleted</Text>
              <Box
                direction="row"
                justify="end"
              >
                <Button
                  label="Return"
                  onClick={() => navigate('/incidents')}
                />
              </Box>
            </Box>
          </Box>
        </Layer>
      )}
      <IncidentInner
        editing={edit}
        setEditing={setEdit}
        incident={data.incident}
        fetchMore={fetchMore}
        subscribeToMore={subscribeToMore}
        loading={loading}
      />
    </PresenceProvider>
  )
}
