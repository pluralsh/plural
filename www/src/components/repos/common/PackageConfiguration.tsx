import { Div, Flex } from 'honorable'
import { useOutletContext } from 'react-router-dom'
import { Code, PageTitle } from '@pluralsh/design-system'

import { PackageActions } from './misc'

export default function PackageConfiguration() {
  const { currentHelmChart, currentTerraformChart } = useOutletContext() as any
  const valuesTemplate = (currentHelmChart || currentTerraformChart)?.valuesTemplate

  return (
    <Flex
      flexDirection="column"
      height="100%"
      minHeight={0}
      overflow="hidden"
    >
      <Div>
        <PageTitle heading="Configuration">
          <Flex display-desktop-up="none"><PackageActions /></Flex>
        </PageTitle>
      </Div>
      <Flex
        height="100%"
        flexDirection="column"
        overflow="hidden"
      >
        {valuesTemplate ? (
          <Code
            maxHeight="100%"
            language="yaml"
            onSelectedTabChange={() => {}}
          >{valuesTemplate}
          </Code>
        ) : <Div body2>No configuration found.</Div>}
      </Flex>
    </Flex>
  )
}
