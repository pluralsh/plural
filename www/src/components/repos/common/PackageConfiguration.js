import { useContext } from 'react'

import { Box } from 'grommet'

import Highlight from 'react-highlight.js'

import ChartContext from '../../../contexts/ChartContext'

export default function PackageConfiguration() {
  const { current } = useContext(ChartContext)

  return (
    <Box pad="large"><Highlight language="yaml">{current?.valuesTemplate || 'n/a'}</Highlight></Box>
  )
}
