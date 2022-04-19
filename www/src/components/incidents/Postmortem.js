import { Box } from 'grommet'

import Markdown from './Markdown'

export function Postmortem({ incident: { postmortem } }) {
  return (
    <Box
      fill
      pad="small"
    >
      <Markdown text={postmortem.content} />
    </Box>
  )
}
