import { Flex, H1, Text } from 'honorable'
import { Box } from 'grommet'
import { Chip } from 'pluralsh-design-system'

const gradeColors = {
  A: '#A5F8C8',
  B: '#A5F8C8',
  C: '#FFE78F',
  D: '#FFE78F',
  E: '#FDB1A5',
  F: '#FDB1A5',
}

export function PackageGrade({ scan, large }) {
  if (!scan) return null

  return (
    <Chip
      paddingHorizontal={large ? 'medium' : 'small'}
      backgroundColor="fill-two"
      borderColor="border-fill-two"
    >
      <Text
        color={gradeColors[scan.grade]}
        fontWeight="600"
      >
        {scan.grade}
      </Text>
    </Chip>
  )
}

export function PackageViewHeader({ title, children }) {
  return (
    <Box
      direction="row"
      border="bottom"
      pad={{ bottom: 'medium' }}
      margin={{ bottom: 'small' }}
    >
      <H1>{title}</H1>
      <Flex
        flexGrow={1}
        justifyContent="flex-end"
      >
        {children}
      </Flex>
    </Box>
  )
}
