import { Box } from 'grommet'

import { Div } from 'honorable'

import { useOutletContext } from 'react-router-dom'

import MultilineCode from '../../utils/Code'

import { PackageViewHeader } from './misc'

export default function PackageConfiguration() {
  const { currentHelmChart, currentTerraformChart } = useOutletContext()
  const valuesTemplate = (currentHelmChart || currentTerraformChart)?.valuesTemplate

  return (
    <Box
      fill
      flex={false}
      gap="small"
    >
      <PackageViewHeader title="Configuration" />
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
