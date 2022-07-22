import { useContext } from 'react'

import { Box } from 'grommet'

import { Div } from 'honorable'

import ChartContext from '../../../contexts/ChartContext'

import MultilineCode from '../../utils/Code'

import { PackageViewHeader } from './misc'

export default function PackageConfiguration() {
  const { currentHelmChart, currentTerraformChart } = useContext(ChartContext)
  const valuesTemplate = (currentHelmChart || currentTerraformChart)?.valuesTemplate

  return (
    <Box
      fill
      flex={false}
      pad="medium"
      gap="small"
    >
      <PackageViewHeader title="Configuration" />
      {valuesTemplate ? (
        <MultilineCode
          borderRadius="medium"
          language="yaml"
          px="1em"
          py="0.65em"
          background="fill-one"
        >
          {valuesTemplate}
        </MultilineCode>
      ) : (<Div body2>No configuration found.</Div>)}

    </Box>
  )
}
