import { Box } from 'grommet'

import Markdown from './Markdown'

export function Postmortem({ incident: { postmortem } }: any) {
  return (
    <Box
      fill
      pad="small"
    >
      <Markdown text={postmortem.content} />
    </Box>
  )
}
