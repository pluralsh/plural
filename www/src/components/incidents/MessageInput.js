import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { FilePicker } from 'react-file-picker'
import { useMutation } from '@apollo/client'
import { Box, Drop, Keyboard, Layer, Stack, Text } from 'grommet'
import { MoonLoader, SyncLoader } from 'react-spinners'
import { Progress } from 'react-sweet-progress'
import { Editor as SlateEditor, Transforms } from 'slate'
import { useParams } from 'react-router-dom'
import { Attachment, Close, Emoji, SendMessage } from 'forge-core'
import fs from 'filesize'
import { NimbleEmoji, emojiIndex } from 'emoji-mart'
import { ThemeContext } from 'styled-components'
import { normalizeColor } from 'grommet/utils'

import Avatar from '../users/Avatar'
import { appendConnection, updateCache } from '../../utils/graphql'

import { isEmpty, plainDeserialize, plainSerialize } from '../../utils/slate'
import { useEditor } from '../utils/hooks'
import { CurrentUserContext } from '../login/CurrentUser'

import { PresenceContext } from './Presence'
import { EmojiPicker } from './Emoji'

import { EntityType } from './types'
import { Control } from './MessageControls'
import { AttachmentContext } from './AttachmentProvider'

import Editor from './Editor'

import { CREATE_MESSAGE, INCIDENT_Q, SEARCH_USERS } from './queries'

export const MessageScrollContext = createContext({})

export function fetchUsers(client, query, incidentId) {
  if (!query) return

  return client.query({
    query: SEARCH_USERS,
    variables: { q: query, incidentId } })
  .then(({ data }) => data.searchUsers.edges.map(edge => ({
    key: edge.node.id,
    value: userNode(edge.node),
    suggestion: userSuggestion(edge.node),
  })))
}

function fetchEmojis(client, query) {
  if (!query) return

  return Promise.resolve(
    emojiIndex
      .search(query)
      .slice(0, 5)
      .map(emoji => ({
        key: emoji.colons,
        value: emojiNode(emoji),
        suggestion: emojiSuggestion(emoji),
      }))
  )
}

export const emojiNode = emoji => {
  const name = emoji.short_names ? emoji.short_names[0] : emoji.name

  return { type: EntityType.EMOJI, children: [{ text: name }], emoji: { ...emoji, name } }
}

export const userNode = user => ({ type: EntityType.MENTION, children: [{ text: user.name }], user })

export function userSuggestion(user) {
  return (
    <Box
      flex={false}
      direction="row"
      align="center"
      pad="xsmall"
      gap="xsmall"
      justify="end"
    >
      <Box
        flex={false}
        direction="row"
        align="center"
        gap="xsmall"
      >
        <Avatar
          user={user}
          size="30px"
        />
        <Text
          size="small"
          weight={500}
        >{user.name}
        </Text>
      </Box>
      <Box
        width="100%"
        direction="row"
        justify="end"
      >
        <Text size="small">{user.email}</Text>
      </Box>
    </Box>
  )
}

function emojiSuggestion(emoji) {
  return (
    <Box
      direction="row"
      align="center"
      pad="xsmall"
      gap="xsmall"
    >
      <NimbleEmoji
        set="google"
        emoji={emoji.short_names[0]}
        size={16}
      />
      <Text size="xsmall">{emoji.colons}</Text>
    </Box>
  )
}

function* extractEntities(editorState) {
  let startIndex = 0
  for (const { children } of editorState) {
    for (const { type, text, user, ...child } of children) {
      let content = text
      if (EntityType[type]) {
        content = child.children[0].text
        yield {
          type,
          text: content,
          startIndex,
          endIndex: startIndex + content.length,
          userId: user && user.id,
        }
      }

      startIndex += content.length
    }
    startIndex++
  }
}

const insertEmoji = (editor, emoji) => {
  let at
  if (editor.selection) {
    at = editor.selection
  }
  else if (editor.children.length > 0) {
    at = SlateEditor.end(editor, [])
  }
  else {
    at = [0]
  }
  Transforms.insertNodes(editor, emojiNode(emoji), { at })
  Transforms.move(editor)
}

function SendMsg({ loading, empty, onClick }) {
  return (
    <Box
      flex={false}
      focusIndicator={false}
      margin="4px"
      height="35px"
      width="35px"
      round="xxsmall"
      align="center"
      justify="center"
      onClick={empty ? null : onClick}
      background={loading ? null : (empty ? null : 'success')}
    >
      {loading ?
        <MoonLoader size={20} /> : (
          <SendMessage
            size="23px"
            color={empty ? 'light-3' : 'white'}
          />
        )}
    </Box>
  )
}

function FileInput() {
  const { attachment, setAttachment } = useContext(AttachmentContext)

  return (
    <FilePicker
      onChange={file => setAttachment(file)}
      maxSize={2000}
      onError={console.log}
    >
      <Control
        onClick={() => null}
        hoverIndicator="light-2"
        focusIndicator={false}
        tooltip="add attachment"
        align="center"
        justify="center"
      >
        <Attachment
          color={attachment ? 'action' : null}
          size="15px"
        />
      </Control>
    </FilePicker>
  )
}

function EmojiInput({ editor }) {
  const ref = useRef()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Box
        ref={ref}
        flex={false}
      >
        <Control
          onClick={() => setOpen(true)}
          hoverIndicator="light-2"
          focusIndicator={false}
          tooltip="add emoji"
          align="center"
          justify="center"
        >
          <Emoji size="15px" />
        </Control>
      </Box>
      {open && (
        <Drop
          target={ref.current}
          align={{ bottom: 'top' }}
          onClickOutside={() => setOpen(false)}
        >
          <EmojiPicker onSelect={emoji => insertEmoji(editor, emoji)} />
        </Drop>
      )}
    </>
  )
}

function UploadProgress({ attachment, uploadProgress, setAttachment, empty }) {
  return (
    <Layer
      plain
      modal={false}
      position="top-right"
    >
      <Stack
        width="400px"
        margin={{ right: '20px', top: '70px' }}
        anchor="top-right"
      >
        <Box
          width="400px"
          gap="xsmall"
          pad="small"
          round="xsmall"
          background="dark-1"
        >
          {attachment && (
            <Box>
              <Text
                size="small"
                weight={500}
              >{attachment.name}
              </Text>
              <Text
                size="small"
                color="dark-3"
              >{fs(attachment.size)}
              </Text>
            </Box>
          )}
          {!uploadProgress ?
            <Text size="small">{empty ? 'add a message and upload' : 'press enter to upload'}</Text> : (
              <Progress
                percent={uploadProgress}
                status={uploadProgress === 100 ? 'success' : 'active'}
              />
            )}
        </Box>
        <Box
          flex={false}
          pad="xsmall"
          round="xsmall"
          focusIndicator={false}
          margin={{ top: 'xsmall', right: 'xsmall' }}
          hoverIndicator="dark-2"
          onClick={() => setAttachment(null)}
        >
          <Close
            size="12px"
            color="white"
          />
        </Box>
      </Stack>
    </Layer>
  )
}

const PLUGIN_TEMPLATES = [
  { trigger: /^@(\w+)$/, suggestions: fetchUsers },
  { trigger: /^:(\w+)$/, suggestions: fetchEmojis },
]

function Typing() {
  const { name: ignore } = useContext(CurrentUserContext)
  const { typists } = useContext(PresenceContext)
  const theme = useContext(ThemeContext)
  const typing = typists.filter(name => name !== ignore)
  const len = typing.length
  if (len === 0) {
    return null
  }
  let text = { users: `${len}`, suffix: 'people are typing' }

  if (len === 1) {
    text = { users: typing[0], suffix: 'is typing' }
  }
  else if (len <= 3) {
    text = { users: typing.join(', '), suffix: 'are typing' }
  }

  return (
    <Box
      direction="row"
      align="center"
      gap="xxsmall"
    >
      <Text
        color="dark-4"
        size="xsmall"
        weight={500}
      >{text.users}
      </Text>
      <Text
        color="dark-4"
        size="xsmall"
      >{text.suffix}
      </Text>
      <Box pad={{ vertical: '2px' }}>
        <SyncLoader
          size={2}
          color={normalizeColor('dark-4', theme)}
        />
      </Box>
    </Box>
  )
}

export function MessageInput() {
  const { returnToBeginning } = useContext(MessageScrollContext)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { attachment, setAttachment } = useContext(AttachmentContext)
  const editor = useEditor()
  const [editorState, setEditorState] = useState(plainDeserialize(''))
  const { incidentId } = useParams()
  const [disable, setDisable] = useState(false)
  const [mutation, { loading }] = useMutation(CREATE_MESSAGE, {
    variables: { incidentId },
    context: { fetchOptions: {
      useUpload: !!attachment,
      onProgress: ev => setUploadProgress(Math.round((ev.loaded / ev.total) * 100)),
      onAbortPossible: () => null,
    } },
    update: (cache, { data: { createMessage } }) => updateCache(cache, {
      query: INCIDENT_Q,
      variables: { id: incidentId },
      update: ({ incident, ...prev }) => ({
        ...prev,
        incident: appendConnection(incident, createMessage, 'messages'),
      }),
    }),
    onCompleted: () => {
      returnToBeginning()
      setUploadProgress(0)
      setAttachment(null)
      setDisable(false)
    },
  })

  const submit = useCallback(() => {
    if (disable) return
    const entities = [...extractEntities(editorState)]
    const file = attachment ? { blob: attachment } : null
    mutation({ variables: { attributes: { text: plainSerialize(editorState), file, entities } } })
    Transforms.select(editor, SlateEditor.start(editor, []))
    setEditorState(plainDeserialize(''))
  }, [mutation, setEditorState, editorState, editor, disable, attachment])

  const empty = isEmpty(editorState)

  return (
    <Box
      flex={false}
      fill="horizontal"
    >
      {(attachment || uploadProgress > 0) && (
        <UploadProgress
          attachment={attachment}
          setAttachment={setAttachment}
          uploadProgress={uploadProgress}
          empty={empty}
        />
      )}
      <Box
        flex={false}
        background="white"
        border={{ color: 'dark-3' }}
        style={{ maxHeight: '210px', minHeight: 'auto' }}
        round="xsmall"
        margin={{ horizontal: 'small', bottom: 'small' }}
      >
        <Keyboard onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey && !empty) {
            submit()
            e.preventDefault()
          }
        }}
        >
          <Box
            fill="horizontal"
            direction="row"
            align="center"
            pad="xxsmall"
          >
            <Editor
              editor={editor}
              editorState={editorState}
              setEditorState={setEditorState}
              incidentId={incidentId}
              disableSubmit={setDisable}
              handlers={PLUGIN_TEMPLATES}
              clearable
            />
            <EmojiInput editor={editor} />
            <FileInput />
            <SendMsg
              loading={loading}
              empty={empty}
              onClick={submit}
            />
          </Box>
        </Keyboard>
      </Box>
      <Box
        direction="row"
        align="center"
      >
        <Typing />
      </Box>
    </Box>
  )
}
