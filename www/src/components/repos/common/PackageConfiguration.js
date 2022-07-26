import { Box } from 'grommet'

import { Div } from 'honorable'

import { useOutletContext } from 'react-router-dom'

import { PageTitle } from 'pluralsh-design-system'

import MultilineCode from '../../utils/Code'

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
      {valuesTemplate ? (
        <MultilineCode
          language="yaml"
          borderRadius="medium"
          background="fill-one"
        >
          {valuesTemplate}
        </MultilineCode>
      ) : (<Div body2>No configuration found.</Div>)}

    </Box>
  )
}
