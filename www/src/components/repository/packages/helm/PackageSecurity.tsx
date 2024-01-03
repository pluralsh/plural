import { useState } from 'react'
import { Box, Collapsible } from 'grommet'
import {
  Chip,
  CollapseIcon,
  ErrorIcon,
  PageTitle,
} from '@pluralsh/design-system'
import { Button, Div, Flex, H2, Span } from 'honorable'
import Clamp from 'react-multiline-clamp'

import { useOutletContext } from 'react-router-dom'
import capitalize from 'lodash/capitalize'

import { Table, TableData, TableRow } from '../../../utils/Table'
import {
  PackageActions,
  PackageGrade,
  PackageProperty,
  chipSeverity,
} from '../misc'
import styled, { useTheme } from 'styled-components'
import { ScrollablePage } from '../../../utils/layout/ScrollablePage'

const HeadingSC = styled.h2(({ theme }) => ({
  ...theme.partials.text.subtitle1,
  marginBottom: theme.spacing.medium,
}))

function ScanViolation({ violation, last }: any) {
  const [open, setOpen] = useState(false)

  return (
    <Flex direction="column">
      <TableRow
        last={last}
        hoverIndicator="fill-one-hover"
        cursor="pointer"
        onClick={() => setOpen(!open)}
      >
        <TableData>
          <CollapseIcon
            marginLeft="8px"
            size={8}
            style={
              open
                ? {
                    transform: 'rotate(270deg)',
                    transitionDuration: '.2s',
                    transitionProperty: 'transform',
                  }
                : {
                    transform: 'rotate(180deg)',
                    transitionDuration: '.2s',
                    transitionProperty: 'transform',
                  }
            }
          />
        </TableData>
        <TableData>
          {violation.ruleId} {violation.ruleName}
        </TableData>
        <TableData>
          <Chip
            severity={chipSeverity[violation.severity?.toLowerCase()]}
            backgroundColor="fill-two"
            borderColor="border-fill-two"
          >
            <Span fontWeight="600">{capitalize(violation.severity)}</Span>
          </Chip>
        </TableData>
      </TableRow>
      <Collapsible
        open={open}
        direction="vertical"
      >
        <Box
          direction="row"
          pad={{ horizontal: 'large', vertical: 'medium' }}
          gap="small"
          // @ts-expect-error
          borderBottom={last ? null : '1px solid border'}
          background="fill-two"
          round={{ corner: 'bottom', size: '4px' }}
        >
          <Box basis="1/2">
            <PackageProperty header="Error message">
              {violation.description}
            </PackageProperty>
          </Box>
          <Box
            basis="1/2"
            gap="small"
          >
            <PackageProperty header="Resource">{`${violation.resourceType}.${violation.resourceName}`}</PackageProperty>
            <PackageProperty header="Location">{`${violation.file}:${violation.line}`}</PackageProperty>
          </Box>
        </Box>
      </Collapsible>
    </Flex>
  )
}

export default function PackageSecurity() {
  const theme = useTheme()
  const { currentHelmChart, currentTerraformChart } = useOutletContext() as any
  const current = currentHelmChart || currentTerraformChart

  return (
    <ScrollablePage
      heading="Security"
      headingContent={
        <div
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.large,
          }}
        >
          {current?.scan && (
            <PackageGrade
              grade={current.scan.grade}
              large
            />
          )}
          <Flex display-desktop-up="none">
            <PackageActions />
          </Flex>
        </div>
      }
    >
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.xlarge,
        }}
      >
        <div>
          <HeadingSC>Scan failures</HeadingSC>
          {current.scan?.errors?.length ? (
            <div
              css={{
                display: 'flex',

                flexDirection: 'column',
                flex: 'grow',
                overflow: 'auto',
                background: theme.colors['fill-one'],
                border: theme.borders.default,
                borderRadius: theme.borderRadiuses.medium,
                maxHeight: 440,
                minHeight: 260,
              }}
            >
              {current.scan?.errors.map((item, i) => (
                <div
                  key={i}
                  css={{
                    display: 'flex',
                    flexGrow: 1,
                    alignItems: 'center',
                    gap: theme.spacing.medium,
                    padding: `${theme.spacing.medium}px ${theme.spacing.small}px`,
                    borderBottom:
                      i === current.scan.errors.length - 1
                        ? undefined
                        : theme.borders.default,
                  }}
                >
                  <ErrorIcon
                    size={16}
                    color={theme.colors['icon-error']}
                  />
                  <Clamp
                    withToggle
                    lines={2}
                    showMoreElement={({ toggle }) => (
                      <Button
                        secondary
                        height="40px"
                        width="70px"
                        marginLeft="medium"
                        onClick={toggle}
                      >
                        More
                      </Button>
                    )}
                    showLessElement={({ toggle }) => (
                      <Button
                        secondary
                        onClick={toggle}
                        css={{ minWidth: 70, marginLeft: theme.spacing.medium }}
                      >
                        Hide
                      </Button>
                    )}
                  >
                    <p css={{ margin: 0 }}>{item.message}</p>
                  </Clamp>
                </div>
              ))}
            </div>
          ) : (
            <Div body2>No scan failures found.</Div>
          )}
        </div>
        <div>
          <HeadingSC>Vulnerabilities</HeadingSC>
          {current.scan?.violations?.length ? (
            <Table
              headers={['', 'Rule', 'Severity']}
              sizes={['40px', '80%', '15%']}
              background="fill-one"
              width="100%"
            >
              {current.scan?.violations.map((vio, ind, arr) => (
                <ScanViolation
                  key={`${ind}`}
                  violation={vio}
                  last={ind === arr.length - 1}
                />
              ))}
            </Table>
          ) : (
            <Div body2>No vulnerabilities found.</Div>
          )}
        </div>
      </div>
    </ScrollablePage>
  )
}
