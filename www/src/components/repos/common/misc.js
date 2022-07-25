import { A, Div, Flex, H2, Img, Span, Text } from 'honorable'
import { Box } from 'grommet'
import { ArrowLeftIcon, Chip } from 'pluralsh-design-system'
import { Link } from 'react-router-dom'

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
      height={large ? '32px' : '24px'}
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

export function PackageBackButton({ link }) {
  return (
    <Box
      direction="row"
      pad={{ horizontal: 'medium', top: 'medium', bottom: 'small' }}
    >
      <A
        as={Link}
        to={link}
        fontFamily="Monument Semi-Mono, monospace"
        fontWeight={500}
        display="flex"
        alignContent="center"
      >
        <ArrowLeftIcon
          size={14}
          marginRight="13px"
        />
        <Span>Back to packages</Span>
      </A>
    </Box>
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
        fontWeight="500"
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
      height="65px"
    >
      <Text
        fontSize="30px"
        fontWeight="500"
        lineHeight="40px"
      >
        {title}
      </Text>
      <Flex
        flexGrow={1}
        justifyContent="flex-end"
      >
        {children}
      </Flex>
    </Box>
  )
}

export function PackageProperty({ children, header }) {
  return (
    <>
      <Div
        caption
        color="text-xlight"
        marginBottom="xxxsmall"
      >
        {header}
      </Div>
      <Div>{children}</Div>
    </>
  )
}
