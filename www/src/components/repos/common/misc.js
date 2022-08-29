import {
  Div, Flex, H2, Img, Span,
} from 'honorable'
import { Box } from 'grommet'
import {
  Chip, ListBoxFooterPlus, ListBoxItem, ListBoxItemChipList, Select,
} from 'pluralsh-design-system'
import { extendConnection } from 'utils/graphql'

import { useOutletContext } from 'react-router-dom'

import { ChartActions } from '../Chart'
import { TerraformActions } from '../Terraform'

export function dockerPull(registry, { tag, dockerRepository: { name, repository } }) {
  return `${registry}/${repository.name}/${name}:${tag}`
}

export const chipSeverity = {
  low: 'success',
  medium: 'warning',
  high: 'error',
  critical: 'critical',
}

const gradeToColor = {
  A: '#A5F8C8',
  B: '#A5F8C8',
  C: '#FFE78F',
  D: '#FFE78F',
  E: '#FDB1A5',
  F: '#FDB1A5',
}

export function PackageGrade({ grade, large }) {
  return (
    <Chip
      size={large ? 'large' : 'medium'}
      paddingHorizontal={large ? 'large' : 'small'}
      backgroundColor="fill-two"
      borderColor="border-fill-two"
    >
      <Span color={gradeToColor[grade]}>{grade}</Span>
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
        fontWeight="500"
      >
        {name}
      </H2>
    </Box>
  )
}

export function PackageVersionPicker({
  edges, installed, version, setVersion, pageInfo, fetchMore,
}) {
  const versions = edges.map(({ node }) => node)

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
            textValue={v.version}
            rightContent={(
              <ListBoxItemChipList
                maxVisible={1}
                showExtra
                chips={[
                  ...(v.id === installed?.version?.id ? ([
                    <Chip
                      severity="success"
                      size="small"
                    >
                      Installed
                    </Chip>,
                  ]) : []),
                  ...v.tags.map(({ tag }, i) => (
                    <Chip
                      key={i}
                      size="small"
                    >
                      {tag}
                    </Chip>
                  )),
                ]}
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

export function PackageProperty({ children, header, ...props }) {
  return (
    <>
      <Div
        caption
        color="text-xlight"
        marginBottom="xxxsmall"
      >
        {header}
      </Div>
      <Div {...props}>{children}</Div>
    </>
  )
}

export function PackageActions() {
  const {
    helmChart, currentHelmChart, terraformChart, currentTerraformChart,
  } = useOutletContext()

  if (helmChart && currentHelmChart) {
    return (
      <ChartActions
        chart={helmChart}
        currentVersion={currentHelmChart}
      />
    )
  }

  if (terraformChart && currentTerraformChart) {
    return (
      <TerraformActions
        terraformModule={terraformChart}
        currentVersion={currentTerraformChart}
      />
    )
  }

  return null
}
