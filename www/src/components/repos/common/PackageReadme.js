import { Box } from 'grommet'

import { useOutletContext } from 'react-router-dom'

import RepositoryDescriptionMarkdown from '../../repository/RepositoryDescriptionMarkdown'

import { PackageViewHeader } from './misc'

export default function PackageReadme() {
  const { currentHelmChart, currentTerraformChart } = useOutletContext()
  const readme = (currentHelmChart || currentTerraformChart)?.readme || 'No readme found.'

  return (
    <Box
      fill
      flex={false}
      gap="small"
    >
      <PackageViewHeader title="Readme" />
      <RepositoryDescriptionMarkdown text={readme} />
    </Box>
  )
}
