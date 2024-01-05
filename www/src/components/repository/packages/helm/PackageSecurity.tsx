import { useState } from 'react'
import { Collapsible } from 'grommet'
import { Button, Chip, CollapseIcon, ErrorIcon } from '@pluralsh/design-system'
import Clamp from 'react-multiline-clamp'

import { useOutletContext } from 'react-router-dom'
import capitalize from 'lodash/capitalize'

import styled, { useTheme } from 'styled-components'

import { Table, TableData, TableRow } from '../../../utils/Table'
import {
  PackageActions,
  PackageGrade,
  PackageProperty,
  chipSeverity,
} from '../misc'
import { ScrollablePage } from '../../../utils/layout/ScrollablePage'

const Body2SC = styled.p(({ theme }) => ({
  margin: 0,
  ...theme.partials.text.body2,
}))
const HeadingSC = styled.h2(({ theme }) => ({
  ...theme.partials.text.subtitle1,
  marginBottom: theme.spacing.medium,
}))
const VulnDetailsSC = styled.div<{ $last }>(({ theme, $last: last }) => ({
  display: 'flex',
  gap: theme.spacing.medium,
  flexDirection: 'row',
  padding: `${theme.spacing.medium}px ${theme.spacing.large}px`,
  background: theme.colors['fill-two'],
  borderColor: theme.colors.border,
  ...(last
    ? {
        borderBottomRightRadius: theme.borderRadiuses.medium,
        borderBottomLeftRadius: theme.borderRadiuses.medium,
      }
    : { borderBottom: theme.borders.default }),
}))

function ScanViolation({ violation, last }: any) {
  const theme = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div css={{ display: 'flex', flexDirection: 'column' }}>
      <TableRow
        last={last}
        hoverIndicator="fill-one-hover"
        cursor="pointer"
        onClick={() => setOpen(!open)}
      >
        <TableData>
          <CollapseIcon
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
            css={{
              marginLeft: theme.spacing.xsmall,
            }}
          />
        </TableData>
        <TableData>
          {violation.ruleId} {violation.ruleName}
        </TableData>
        <TableData>
          <Chip
            severity={chipSeverity[violation.severity?.toLowerCase()]}
            fillLevel={2}
          >
            {capitalize(violation.severity)}
          </Chip>
        </TableData>
      </TableRow>
      <Collapsible
        open={open}
        direction="vertical"
      >
        <VulnDetailsSC $last={last}>
          <div css={{ flexBasis: '50%' }}>
            <PackageProperty header="Error message">
              {violation.description}
            </PackageProperty>
          </div>
          <div
            css={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.small,
              flexBasis: '50%',
            }}
          >
            <PackageProperty header="Resource">{`${violation.resourceType}.${violation.resourceName}`}</PackageProperty>
            <PackageProperty header="Location">{`${violation.file}:${violation.line}`}</PackageProperty>
          </div>
        </VulnDetailsSC>
      </Collapsible>
    </div>
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
          <PackageActions />
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
                    color={theme.colors['icon-danger']}
                  />
                  <Clamp
                    withToggle
                    lines={2}
                    showMoreElement={({ toggle }) => (
                      <Button
                        secondary
                        onClick={toggle}
                        css={{
                          minWidth: 70,
                          marginLeft: theme.spacing.medium,
                        }}
                      >
                        More
                      </Button>
                    )}
                    showLessElement={({ toggle }) => (
                      <Button
                        secondary
                        onClick={toggle}
                        css={{
                          minWidth: 70,
                          marginLeft: theme.spacing.medium,
                        }}
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
            <Body2SC>No scan failures found.</Body2SC>
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
              overflow="hidden"
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
            <Body2SC>No vulnerabilities found.</Body2SC>
          )}
        </div>
      </div>
    </ScrollablePage>
  )
}
