import { useCallback, useState } from 'react'
import { Anchor, Box, Layer, Text } from 'grommet'
import { Button, Check as Checkmark, Notification, Owner, SecondaryButton } from 'forge-core'
import { Zoom } from 'grommet-icons'
import { useMutation } from '@apollo/client'

import { Editable, Slate } from 'slate-react'

import { ModalHeader } from '../ModalHeader'
import { plainDeserialize, plainSerialize } from '../../utils/slate'

import { updateCache } from '../../utils/graphql'

import { useEditor } from '../utils/hooks'

import { ACCEPT_INCIDENT, COMPLETE_INCIDENT, FOLLOW, INCIDENT_Q, UNFOLLOW, ZOOM_MEETING } from './queries'

import { IncidentStatus } from './types'

import { NotificationPreferences } from './NotificationPreferences'

import { Attribute, Attributes } from './utils'

function Control({ icon, onClick }) {
  return (
    <Box
      pad="xsmall"
      round="xsmall"
      hoverIndicator="light-3"
      onClick={onClick}
      focusIndicator={false}
    >
      {icon}
    </Box>
  )
}

function AcceptIncident({ incident: { id } }) {
  const [mutation] = useMutation(ACCEPT_INCIDENT, { variables: { id } })

  return (
    <Control
      icon={<Owner size="small" />}
      onClick={mutation}
    />
  )
}

function CompleteIncident({ incident: { id } }) {
  const [open, setOpen] = useState(false)
  const [attributes, setAttributes] = useState({ content: '' })
  const [editorState, setEditorState] = useState(plainDeserialize(attributes.content))
  const editor = useEditor()
  const setContent = useCallback(editorState => {
    setEditorState(editorState)
    setAttributes({ ...attributes, content: plainSerialize(editorState) })
  }, [setAttributes, attributes, setEditorState])
  const [mutation, { loading }] = useMutation(COMPLETE_INCIDENT, {
    variables: { id, attributes },
    onCompleted: () => setOpen(false),
  })

  return (
    <>
      <Control
        icon={<Checkmark size="small" />}
        onClick={() => setOpen(true)}
      />
      {open && (
        <Layer
          position="center"
          modal
          onClickOutside={() => setOpen(false)}
        >
          <Box width="40vw">
            <ModalHeader
              text="IncidentPostmortem"
              setOpen={setOpen}
            />
            <Box
              fill="horizontal"
              pad="small"
              gap="small"
            >
              <Box style={{ minHeight: '30vh', overflow: 'auto', maxHeight: '80vh' }}>
                <Slate
                  editor={editor}
                  value={editorState}
                  onChange={setContent}
                >
                  <Editable
                    style={{ minHeight: '30vh' }}
                    placeholder="Write a few paragraphs debriefing this incident"
                  />
                </Slate>
              </Box>
              <Box
                direction="row"
                justify="end"
                align="center"
                gap="xsmall"
              >
                <SecondaryButton
                  label="Cancel"
                  onClick={() => setOpen(false)}
                />
                <Button
                  label="Complete"
                  disabled={attributes.content.length === 0}
                  loading={loading}
                  onClick={mutation}
                />
              </Box>
            </Box>
          </Box>
        </Layer>
      )}
    </>
  )
}

const followerPreferences = follower => {
  if (!follower) return { message: true, incidentUpdate: true, mention: true }
  const { message, incidentUpdate, mention } = follower.preferences

  return { message, incidentUpdate, mention }
}

function Follower({ incident: { id, follower } }) {
  const [open, setOpen] = useState(false)
  const [preferences, setPreferences] = useState(followerPreferences(follower))
  const [mutation, { loading }] = useMutation(FOLLOW, {
    variables: { id, attributes: { preferences } },
    update: (cache, { data: { followIncident } }) => updateCache(cache, {
      query: INCIDENT_Q,
      variables: { id },
      update: ({ incident, ...prev }) => ({ ...prev, incident: { ...incident, follower: followIncident } }),
    }),
  })
  const [unfollow, { loading: unfollowing }] = useMutation(UNFOLLOW, {
    variables: { id },
    update: cache => updateCache(cache, {
      query: INCIDENT_Q,
      variables: { id },
      update: ({ incident, ...prev }) => ({ ...prev, incident: { ...incident, follower: null } }),
    }),
    onCompleted: () => setOpen(false),
  })

  return (
    <>
      <Control
        icon={<Notification size="small" />}
        onClick={() => setOpen(true)}
      />
      {open && (
        <Layer
          position="center"
          modal
          onClickOutside={() => setOpen(false)}
        >
          <Box width="40vw">
            <ModalHeader
              text={follower ? 'Update subscription settings' : 'Subscribe to this incident'}
              setOpen={setOpen}
            />
            <Box
              fill="horizontal"
              pad="small"
              gap="small"
            >
              <NotificationPreferences
                preferences={preferences}
                setPreferences={setPreferences}
              />
              <Box
                direction="row"
                justify="end"
                align="center"
                gap="xsmall"
              >
                {follower && (
                  <Button
                    label="Unsubscribe"
                    background="error"
                    loading={unfollowing}
                    onClick={unfollow}
                  />
                )}
                <Button
                  label={follower ? 'Update' : 'Follow'}
                  loading={loading}
                  onClick={mutation}
                />
              </Box>
            </Box>
          </Box>
        </Layer>
      )}
    </>
  )
}

function ZoomMeeting({ incident: { id, title } }) {
  const [open, setOpen] = useState(true)
  const [mutation, { data }] = useMutation(ZOOM_MEETING, {
    variables: { attributes: { incidentId: id, topic: title } },
    onCompleted: () => setOpen(true),
  })

  const meeting = data && data.createZoom

  return (
    <>
      <Box
        flex={false}
        pad={{ horizontal: 'xsmall' }}
        onClick={mutation}
      >
        <Zoom
          size="17px"
          color="plain"
        />
      </Box>
      {meeting && open && (
        <Layer
          modal
          onClickOutside={() => setOpen(false)}
        >
          <Box width="40vw">
            <ModalHeader
              text="Meeting Created!"
              setOpen={setOpen}
            />
            <Box>
              <Attributes>
                <Attribute name="join url">
                  <Anchor
                    href={meeting.joinUrl}
                    target="_blank"
                    label={meeting.joinUrl}
                  />
                </Attribute>
                <Attribute name="password">
                  <Text size="small">{meeting.password}</Text>
                </Attribute>
              </Attributes>
            </Box>
          </Box>
        </Layer>
      )}
    </>
  )
}

export function IncidentControls({ incident }) {
  return (
    <Box
      flex={false}
      direction="row"
      gap="xsmall"
      align="center"
    >
      <ZoomMeeting incident={incident} />
      {incident.status === IncidentStatus.RESOLVED && <CompleteIncident incident={incident} />}
      {!incident.owner && <AcceptIncident incident={incident} />}
      <Follower incident={incident} />
    </Box>
  )
}
