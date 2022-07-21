import { useContext } from 'react'

import { Box } from 'grommet'

import ChartContext from '../../../contexts/ChartContext'

import RepositoryDescriptionMarkdown from '../../repository/RepositoryDescriptionMarkdown'

import { PackageViewHeader } from './misc'

export default function PackageReadme() {
  const { currentHelmChart, currentTerraformChart } = useContext(ChartContext)
  const readme = (currentHelmChart || currentTerraformChart)?.readme || 'n/a'

  return (
    <Box
      fill
      flex={false}
      pad="medium"
      gap="small"
    >
      <PackageViewHeader title="Readme" />
      <RepositoryDescriptionMarkdown text={readme} />
    </Box>
  )
}
