import { useContext } from 'react'

import { Box, Markdown } from 'grommet'

import ChartContext from '../../../contexts/ChartContext'

import { MARKDOWN_STYLING } from '../Chart'

import { PackageViewHeader } from './misc'

export default function PackageReadme() {
  const { current } = useContext(ChartContext)

  return (
    <Box
      fill
      flex={false}
      pad="medium"
      gap="small"
    >
      <PackageViewHeader>Readme</PackageViewHeader>
      <Markdown components={MARKDOWN_STYLING}>{current?.readme || 'n/a'}</Markdown>
    </Box>
  )
}
