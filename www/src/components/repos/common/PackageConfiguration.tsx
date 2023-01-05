import { Box } from 'grommet'
import { Div, Flex } from 'honorable'
import { useOutletContext } from 'react-router-dom'
import { Code, PageTitle } from '@pluralsh/design-system'

import { PackageActions } from './misc'

export default function PackageConfiguration() {
  const { currentHelmChart, currentTerraformChart } = useOutletContext() as any
  const valuesTemplate = (currentHelmChart || currentTerraformChart)?.valuesTemplate

  return (
    <Box
      fill
      flex={false}
      gap="small"
    >
      <PageTitle heading="Configuration">
        <Flex display-desktop-up="none"><PackageActions /></Flex>
      </PageTitle>
      <Box
        pad={{ right: 'xsmall' }}
        overflow={{ vertical: 'auto' }}
      >
        {valuesTemplate ? (
          <Code
            language="yaml"
            onSelectedTabChange={() => {}}
          >{valuesTemplate}
          </Code>
        ) : <Div body2>No configuration found.</Div>}
      </Box>
    </Box>
  )
}
