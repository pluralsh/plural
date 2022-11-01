import { Box } from 'grommet'

import { useOutletContext } from 'react-router-dom'

import { Markdown, PageTitle } from 'pluralsh-design-system'

import { Flex } from 'honorable'

import { PackageActions } from './misc'

export default function PackageReadme() {
  const { currentHelmChart, currentTerraformChart } = useOutletContext() as any
  const readme = (currentHelmChart || currentTerraformChart)?.readme || 'This package does not have a Readme yet.'

  return (
    <Box
      fill
      flex={false}
      gap="small"
    >
      <PageTitle heading="Readme">
        <Flex display-desktop-up="none"><PackageActions /></Flex>
      </PageTitle>
      <Box
        pad={{ right: 'xsmall' }}
        overflow={{ vertical: 'auto' }}
      >
        <Markdown text={readme} />
      </Box>
    </Box>
  )
}
