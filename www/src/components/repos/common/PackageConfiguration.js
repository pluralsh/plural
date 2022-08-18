import { Box } from 'grommet'

import { Div } from 'honorable'

import { useOutletContext } from 'react-router-dom'

import { Code, PageTitle } from 'pluralsh-design-system'

export default function PackageConfiguration() {
  const { currentHelmChart, currentTerraformChart } = useOutletContext()
  const valuesTemplate = (currentHelmChart || currentTerraformChart)?.valuesTemplate

  return (
    <Box
      fill
      flex={false}
      gap="small"
    >
      <PageTitle heading="Configuration" />
      <Box
        pad={{ right: 'small' }}
        overflow={{ vertical: 'auto' }}
      >
        {valuesTemplate ? <Code language="yaml">{valuesTemplate}</Code> : <Div body2>No configuration found.</Div>}
      </Box>
    </Box>
  )
}
