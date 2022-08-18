import { Box } from 'grommet'

import { useOutletContext } from 'react-router-dom'

import { Markdown, PageTitle } from 'pluralsh-design-system'

export default function PackageReadme() {
  const { currentHelmChart, currentTerraformChart } = useOutletContext()
  const readme = (currentHelmChart || currentTerraformChart)?.readme || 'This package does not have a Readme yet.'

  return (
    <Box
      fill
      flex={false}
      gap="small"
    >
      <PageTitle heading="Readme" />
      <Markdown text={readme} />
    </Box>
  )
}
