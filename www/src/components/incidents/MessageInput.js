import React, { useCallback, useContext, useState } from 'react'
import { useEditor } from '../utils/hooks'
import { FilePicker } from 'react-file-picker'
import { useMutation } from 'react-apollo'
import { CREATE_MESSAGE, INCIDENT_Q } from './queries'
import { Box, Keyboard } from 'grommet'
import { plainDeserialize, plainSerialize, isEmpty } from '../../utils/slate'
import { Send } from '../utils/icons'
import { MoonLoader } from 'react-spinners'
import { Transforms, Editor as SlateEditor } from 'slate'
import Editor from './Editor'
import { EntityType } from './types'
import { useParams } from 'react-router'
import { appendConnection, updateCache } from '../../utils/graphql'
import { AttachmentContext } from './AttachmentProvider'
import { Control } from './MessageControls'
import { Attachment } from 'grommet-icons'

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

export function MessageInput() {
  const {attachment} = useContext(AttachmentContext)
  const editor = useEditor()
  const [editorState, setEditorState] = useState(plainDeserialize(''))
  const {incidentId} = useParams()
  const [mutation, {loading}] = useMutation(CREATE_MESSAGE, {
    variables: {incidentId},
    update: (cache, {data: { createMessage }}) => updateCache(cache, {
      query: INCIDENT_Q,
      variables: {id: incidentId},
      update: ({incident, ...prev}) => ({
        ...prev,
        incident: appendConnection(incident, createMessage, 'Message', 'messages') 
      })
    }),
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
  )
}