import {
  A, Div, Flex, H2, Img, Span,
} from 'honorable'
import { Box } from 'grommet'
import {
  ArrowLeftIcon, Chip, ListBoxFooterPlus, ListBoxItem, ListBoxItemChipList, Select,
} from 'pluralsh-design-system'
import { Link } from 'react-router-dom'
import { extendConnection } from 'utils/graphql'

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
      size={large ? 'large' : 'medium'}
      paddingHorizontal={large ? 'large' : 'small'}
      backgroundColor="fill-two"
      borderColor="border-fill-two"
    >
      <Span color={gradeToColor[scan.grade]}>
        {scan.grade}
      </Span>
    </Chip>
  )
}

export function PackageBackButton({ link }) {
  return (
    <Box
      direction="row"
      pad={{ horizontal: '32px', top: 'medium', bottom: 'small' }}
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

// TODO: Implement view more functionality as at the moment it loads only the first page.
export function PackageVersionPicker({
  edges, installed, version, setVersion, pageInfo, fetchMore,
}) {
  const versions = edges.map(({ node }) => node)

  console.log(version.id)
  console.log(installed.version.id)
  console.log(pageInfo)

  return (
    <Box
      width="240px"
      gap="small"
      margin={{ bottom: 'medium' }}
    >
      <Select
        label="version"
        width="240px"
        selectedKey={version.id}
        onSelectionChange={selected => setVersion(versions.find(v => v.id === selected))}
        dropdownFooter={pageInfo.hasNextPage && <ListBoxFooterPlus>View more</ListBoxFooterPlus>}
        onFooterClick={() => fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { versions } }) => extendConnection(prev, versions, 'versions'),
        })}
        rightContent={
          version.id === installed?.version?.id && (
            <ListBoxItemChipList chips={[
              <Chip
                severity="success"
                size="small"
              >
                Installed
              </Chip>,
            ]}
            />
          )
        }
      >
        {versions.map(v => (
          <ListBoxItem
            key={v.id}
            label={v.version}
            rightContent={(
              <ListBoxItemChipList
                maxVisible={2}
                showExtra
                chips={v.tags.map(({ tag }, i) => (
                  <Chip
                    key={i}
                    size="small"
                  >
                    {tag}
                  </Chip>
                ))}
              />
            )}
          />
        ))}
      </Select>
      <Box
        direction="row"
        gap="8px"
      >
        {version?.tags.map(({ tag }, i) => (
          <Chip
            key={i}
            size="small"
          >
            {tag}
          </Chip>
        ))}
      </Box>
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
