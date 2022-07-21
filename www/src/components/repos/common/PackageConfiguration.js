import { useContext } from 'react'

import { Box } from 'grommet'

import Highlight from 'react-highlight.js'

import ChartContext from '../../../contexts/ChartContext'

import { PackageViewHeader } from './misc'

export default function PackageConfiguration() {
  const { currentHelmChart, currentTerraformChart } = useContext(ChartContext)
  const valuesTemplate = (currentHelmChart || currentTerraformChart)?.valuesTemplate || 'n/a'

  return (
    <Box
      fill
      flex={false}
      pad="medium"
      gap="small"
    >
      <PackageViewHeader title="Configuration" />
      <Highlight language="yaml">{valuesTemplate}</Highlight>
    </Box>
  )
}
