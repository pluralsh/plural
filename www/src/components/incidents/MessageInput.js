import React, { useCallback, useContext, useState } from 'react'
import { useEditor } from '../utils/hooks'
import { FilePicker } from 'react-file-picker'
import { useMutation } from 'react-apollo'
import { CREATE_MESSAGE, INCIDENT_Q } from './queries'
import { Box, Keyboard, Layer, Stack, Text } from 'grommet'
import { plainDeserialize, plainSerialize, isEmpty } from '../../utils/slate'
import { Send } from '../utils/icons'
import { MoonLoader } from 'react-spinners'
import { Progress } from 'react-sweet-progress'
import { Transforms, Editor as SlateEditor } from 'slate'
import Editor from './Editor'
import { EntityType } from './types'
import { useParams } from 'react-router'
import { appendConnection, updateCache } from '../../utils/graphql'
import { AttachmentContext } from './AttachmentProvider'
import { Control } from './MessageControls'
import { Attachment, Close } from 'grommet-icons'
import fs from 'filesize'

export const MessageScrollContext = React.createContext({})

function* extractEntities(editorState) {
  let startIndex = 0
  for (const {children} of editorState) {
    for (const {type, text, user, ...child} of children) {
      let content = text
      if (type === EntityType.MENTION) {
        content = child.children[0].text
        yield {
          type: EntityType.MENTION,
          text: content,
          startIndex,
          endIndex: startIndex + content.length,
          userId: user.id
        }
      }

      startIndex += content.length
    }
    startIndex++
  }
}

function SendMsg({loading, empty, onClick}) {
  return (
    <Box flex={false} focusIndicator={false} margin='4px' height='35px'
      width="35px" round='xxsmall' align='center' justify='center'
      onClick={empty ? null : onClick} background={loading ? null : (empty ? null : 'action')} >
      {loading ?
        <MoonLoader size={20} /> :
        <Send size='23px' color={empty ? 'light-3' : 'white'} />
      }
    </Box>
  )
}

function FileInput() {
  const {attachment, setAttachment} = useContext(AttachmentContext)

  return (
    <FilePicker onChange={(file) => setAttachment(file)} maxSize={2000} onError={console.log}>
      <Control onClick={() => null} hoverIndicator='light-2' focusIndicator={false} tooltip='add attachment' 
               align='center' justify='center'>
        <Attachment color={attachment ? 'action' : null} size='15px' />
      </Control>
    </FilePicker>
  )
}

function UploadProgress({attachment, uploadProgress, setAttachment, empty}) {
  return (
    <Layer plain modal={false} position='top-right'>
      <Stack width='400px' margin={{right: '20px', top: '70px'}} anchor='top-right'>
        <Box width='400px' gap='xsmall' pad='small' round='xsmall' background='dark-1'>
          {attachment && (
            <Box>
              <Text size='small' weight={500}>{attachment.name}</Text>
              <Text size='small' color='dark-3'>{fs(attachment.size)}</Text>
            </Box>
          )}
          {!uploadProgress ?
            <Text size='small'>{empty ? 'add a message and upload' : 'press enter to upload'}</Text> :
            <Progress percent={uploadProgress} status={uploadProgress === 100 ? 'success' : 'active'} />
          }
        </Box>
        <Box flex={false} pad='xsmall' round='xsmall' focusIndicator={false} margin={{top: 'xsmall', right: 'xsmall'}}
              hoverIndicator='dark-2' onClick={() => setAttachment(null)}>
          <Close size='12px' color='white' />
        </Box>
      </Stack>
    </Layer>
  )
}

export function MessageInput() {
  const {returnToBeginning} = useContext(MessageScrollContext)
  const [uploadProgress, setUploadProgress] = useState(0)
  const {attachment, setAttachment} = useContext(AttachmentContext)
  const editor = useEditor()
  const [editorState, setEditorState] = useState(plainDeserialize(''))
  const {incidentId} = useParams()
  const [mutation, {loading}] = useMutation(CREATE_MESSAGE, {
    variables: {incidentId},
    context: {fetchOptions: {
      useUpload: !!attachment,
      onProgress: (ev) => setUploadProgress(Math.round((ev.loaded / ev.total) * 100)),
      onAbortPossible: () => null
    }},
    update: (cache, {data: { createMessage }}) => updateCache(cache, {
      query: INCIDENT_Q,
      variables: {id: incidentId},
      update: ({incident, ...prev}) => ({
        ...prev,
        incident: appendConnection(incident, createMessage, 'Message', 'messages') 
      })
    }),
    onCompleted: () => {
      returnToBeginning()
      setUploadProgress(0)
      setAttachment(null)
    }
  })

  const submit = useCallback(() => {
    // const entities = [...extractEntities(editorState)]
    // console.log(entities)
    const file = attachment ? {blob: attachment} : null
    mutation({variables: {attributes: {text: plainSerialize(editorState), file}}})
    Transforms.select(editor, SlateEditor.start(editor, []))
    setEditorState(plainDeserialize(''))
  }, [mutation, setEditorState, editorState, editor, attachment])

  const empty = isEmpty(editorState)

  return (
    <>
    {(attachment || uploadProgress > 0) && (
      <UploadProgress 
        attachment={attachment} 
        setAttachment={setAttachment} 
        uploadProgress={uploadProgress}
        empty={empty} />
    )}
    <Box flex={false} background='white' border={{color: 'dark-3'}} style={{maxHeight: '210px', minHeight: 'auto'}} 
         round='xsmall' margin={{horizontal: 'small', bottom: 'small'}}>
      <Keyboard onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey && !empty) {
          submit()
          e.preventDefault()
        }
      }}>
      <Box fill='horizontal' direction='row' align='center' pad='xxsmall'>
        <Editor
          editor={editor}
          editorState={editorState}
          setEditorState={setEditorState}
          clearable />
        <FileInput />
        <SendMsg loading={loading} empty={empty} onClick={submit} />
      </Box>
      </Keyboard>
    </Box>
    </>
  )
}