import { Flex, H1, H2, Img, Span } from 'honorable'
import { Box } from 'grommet'
import { Chip } from 'pluralsh-design-system'

export function dockerPull(registry, { tag, dockerRepository: { name, repository } }) {
  return `${registry}/${repository.name}/${name}:${tag}`
}

const gradeToColor = {
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
      paddingHorizontal={large ? 'large' : 'small'}
      paddingVertical={large ? 'xxsmall' : 'xxxsmall'}
      backgroundColor="fill-two"
      borderColor="border-fill-two"
    >
      <Span
        color={gradeToColor[scan.grade]}
        fontWeight="600"
      >
        {scan.grade}
      </Span>
    </Chip>
  )
}

export function PackageHeader({ name, icon }) {
  return (
    <Box
      direction="row"
      align="center"
      gap="small"
      margin={{ bottom: 'small' }}
    >
      <Flex
        width="64px"
        height="64px"
        padding="8px"
        align="center"
        justify="center"
        backgroundColor="fill-one"
        border="1px solid border"
        borderRadius={4}
      >
        <Img
          width="48px"
          height="48px"
          src={icon}
        />
      </Flex>
      <H2
        fontSize="20px"
        fontWeight="500px"
      >
        {name}
      </H2>
    </Box>
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
      <H1
        fontSize="30px"
        fontWeight="500"
      >
        {title}
      </H1>
      <Flex
        flexGrow={1}
        justifyContent="flex-end"
      >
        {children}
      </Flex>
    </Box>
  )
}
