import { Box } from 'grommet'

import { useOutletContext } from 'react-router-dom'

import { PageTitle } from 'pluralsh-design-system'

import RepositoryDescriptionMarkdown from '../../repository/RepositoryDescriptionMarkdown'

export default function PackageReadme() {
  const { currentHelmChart, currentTerraformChart } = useOutletContext()
  const readme = (currentHelmChart || currentTerraformChart)?.readme || 'No readme found.'

  return (
    <Box
      fill
      flex={false}
      gap="small"
    >
      <PageTitle heading="Readme" />
      <RepositoryDescriptionMarkdown text={readme} />
    </Box>
  )
}
