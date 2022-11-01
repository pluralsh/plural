import { Node } from 'slate'

export const plainSerialize = nodes => nodes.map(n => Node.string(n)).join('\n')

export const plainDeserialize = text => text.split('\n').map(line => ({ children: [{ text: line }] }))

export function isEmpty(editorState) {
  return (
    editorState.length === 1 && editorState[0].children.length === 1 && editorState[0].children[0].text === ''
  )
}
