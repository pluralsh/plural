import { Box } from 'grommet'
import { useOutletContext } from 'react-router-dom'
import { Div, Flex, H2, Img } from 'honorable'
import {
  Chip,
  ListBoxFooterPlus,
  ListBoxItem,
  ListBoxItemChipList,
  Select,
} from '@pluralsh/design-system'

import styled, { useTheme } from 'styled-components'

import { ComponentProps } from 'react'

import { extendConnection } from '../../../utils/graphql'

import { ChartActions } from './Chart'
import { TerraformActions } from './Terraform'

export function dockerPull(
  registry,
  { tag, dockerRepository: { name, repository } }: any
) {
  return `${registry}/${repository.name}/${name}:${tag}`
}

export const chipSeverity = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'critical',
} as const satisfies Record<
  'low' | 'medium' | 'high' | 'critical',
  ComponentProps<typeof Chip>['severity']
>

const gradeToSeverity = {
  A: 'success',
  B: 'success',
  C: 'warning',
  D: 'warning',
  E: 'danger',
  F: 'critical',
} as const satisfies Record<
  'A' | 'B' | 'C' | 'D' | 'E' | 'F',
  ComponentProps<typeof Chip>['severity']
>

export function PackageGrade({ grade, large }: any) {
  const theme = useTheme()

  return (
    <Chip
      severity={gradeToSeverity[grade] || 'neutral'}
      size={large ? 'large' : 'medium'}
      css={{
        '&&': {
          paddingLeft: large ? theme.spacing.large : theme.spacing.small,
          paddingRight: large ? theme.spacing.large : theme.spacing.small,
        },
      }}
    >
      {grade}
    </Chip>
  )
}

export function PackageHeader({ name, icon }: any) {
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
  edges,
  installed,
  version,
  setVersion,
  pageInfo,
  fetchMore,
}: any) {
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
        onSelectionChange={(selected) =>
          setVersion(versions.find((v) => v.id === selected))
        }
        dropdownFooter={
          pageInfo.hasNextPage && (
            <ListBoxFooterPlus>View more</ListBoxFooterPlus>
          )
        }
        onFooterClick={() =>
          fetchMore({
            variables: { cursor: pageInfo.endCursor },
            updateQuery: (prev, { fetchMoreResult: { versions } }) =>
              extendConnection(prev, versions, 'versions'),
          })
        }
        rightContent={
          version.id === installed?.version?.id && (
            <ListBoxItemChipList
              chips={[
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
        {versions.map((v) => (
          <ListBoxItem
            key={v.id}
            label={v.version}
            textValue={v.version}
            rightContent={
              <ListBoxItemChipList
                maxVisible={1}
                showExtra
                chips={[
                  ...(v.id === installed?.version?.id
                    ? [
                        <Chip
                          severity="success"
                          size="small"
                        >
                          Installed
                        </Chip>,
                      ]
                    : []),
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
            }
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

export function PackageProperty({ children, header, ...props }: any) {
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
const HideAtDesktop = styled.div(({ theme }) => {
  const mqDesktop = `@media (min-width: ${theme.breakpoints.desktop}px)`

  return {
    [mqDesktop]: {
      display: 'none',
    },
  }
})

export function PackageActions() {
  const { helmChart, currentHelmChart, terraformChart, currentTerraformChart } =
    useOutletContext() as any

  if (helmChart && currentHelmChart) {
    return (
      <HideAtDesktop>
        <ChartActions
          chart={helmChart}
          currentVersion={currentHelmChart}
        />
      </HideAtDesktop>
    )
  }

  if (terraformChart && currentTerraformChart) {
    return (
      <HideAtDesktop>
        <TerraformActions
          terraformModule={terraformChart}
          currentVersion={currentTerraformChart}
        />
      </HideAtDesktop>
    )
  }

  return null
}

export function DetailContainer({ children, title, ...rest }: any) {
  return (
    <Box
      border
      round="xsmall"
      {...rest}
    >
      {!!title && (
        <Div
          color="text-xlight"
          fontSize={12}
          overline
        >
          {title}
        </Div>
      )}
      {children}
    </Box>
  )
}
