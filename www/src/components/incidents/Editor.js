import { useApolloClient } from '@apollo/client'

import TypeaheadEditor from '../utils/TypeaheadEditor'

// export function fetchUsers(client, query) {
//   if (!query) return

//   return client.query({
//     query: SEARCH_USERS,
//     variables: {q: query}
//   }).then(({data}) => {
//     return data.users.edges.map(edge => ({
//       key: edge.node.email,
//       value: mentionNode(edge.node),
//       suggestion: userSuggestion(edge.node)
//     }))
//   })
// }

// export function userSuggestion(user) {
//   return (
//     <Box direction='row' align='center' pad='xsmall' gap='xsmall' justify='end'>
//       <Box flex={false} direction='row' align='center' gap='xsmall'>
//         <Avatar size='40px' user={user} />
//         <Text size='small' weight={500}>{user.email}</Text>
//       </Box>
//       <Box width='100%' direction='row' justify='end'>
//         <Text size='small' color='dark-3'>{user.name}</Text>
//       </Box>
//     </Box>
//   )
// }

// const mentionNode = (user) => ({type: EntityType.MENTION, children: [{text: user.name + ' '}], user})

// const PLUGINS = [
//   {trigger: /^@(\w+)$/, suggestions: fetchUsers}
// ]

export default function Editor({ incidentId, editorState, editor, handlers, disableSubmit, setEditorState }) {
  const client = useApolloClient()

  return (
    <TypeaheadEditor
      value={editorState}
      editor={editor}
      searchQuery={(query, callback) => callback(client, query, incidentId)}
      onOpen={disableSubmit}
      handlers={handlers || []}
      setValue={setEditorState}
      style={{
        overflow: 'auto',
        fontFamily: 'Roboto',
        fontSize: '14px',
        width: '100%',
        maxHeight: '160px',
        paddingLeft: '10px',
        paddingTop: '3px',
        paddingBottom: '3px',
      }}
    />
  )
}
