import { useContext } from 'react'

import { Box, Markdown } from 'grommet'

import ChartContext from '../../../contexts/ChartContext'

import { MARKDOWN_STYLING } from '../Chart'

export default function PackageReadme() {
  const { current } = useContext(ChartContext)

  return (
    <Box pad="large"><Markdown components={MARKDOWN_STYLING}>{current?.readme || 'n/a'}</Markdown></Box>
  )
}
