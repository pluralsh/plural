import { useState } from 'react'
import { Box, Collapsible } from 'grommet'
import {
  Chip, CollapseIcon, ErrorIcon, PageTitle,
} from 'pluralsh-design-system'

import {
  Button, Div, Flex, H2, Span,
} from 'honorable'

import Clamp from 'react-multiline-clamp'

import { useOutletContext } from 'react-router-dom'

import { capitalize } from 'lodash/string'

import { Table, TableData, TableRow } from '../../utils/Table'

import { PackageGrade, PackageProperty, chipSeverity } from './misc'

function ScanViolation({ violation, last }) {
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
            style={open ? {
              transform: 'rotate(270deg)',
              transitionDuration: '.2s',
              transitionProperty: 'transform',
            } : {
              transform: 'rotate(180deg)',
              transitionDuration: '.2s',
              transitionProperty: 'transform',
            }}
          />
        </TableData>
        <TableData>{violation.ruleId} {violation.ruleName}</TableData>
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
          pad={{ horizontal: 'large', vertical: 'small' }}
          gap="small"
          borderBottom={last ? null : '1px solid border'}
          background="fill-two"
          round={{ corner: 'bottom', size: '4px' }}
        >
          <Box basis="1/2"><PackageProperty header="Error message">{violation.description}</PackageProperty></Box>
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
  const { currentHelmChart, currentTerraformChart } = useOutletContext()
  const current = currentHelmChart || currentTerraformChart

  return (
    <Box
      fill
      flex={false}
      gap="medium"
    >
      <PageTitle heading="Security">{
        current?.scan && (
          <PackageGrade
            grade={current.scan.grade}
            large
          />
        )
      }
      </PageTitle>
      <Box
        pad={{ right: 'small' }}
        gap="medium"
        overflow={{ vertical: 'auto' }}
      >
        <H2>Scan failures</H2>
        {current.scan.errors?.length ? (
          <Box
            direction="column"
            background="fill-one"
            border
            round="xsmall"
            height={{ max: '460px' }}
            flex="grow"
            overflow="auto"
          >
            {current.scan.errors.map((item, i) => (
              <Box
                key={i}
                direction="row"
                align="center"
                gap="medium"
                pad={{ horizontal: 'medium', vertical: 'small' }}
                height={{ min: '60px' }}
                flex="grow"
                border={i === current.scan.errors.length - 1 ? null : 'bottom'}
              >
                <ErrorIcon
                  size={24}
                  color="icon-error"
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
                      height="40px"
                      width="70px"
                      marginLeft="medium"
                      onClick={toggle}
                    >
                      Hide
                    </Button>
                  )}
                >
                  <p>{item.message}</p>
                </Clamp>
              </Box>
            ))}
          </Box>
        ) : (
          <Div body2>No scan failures found.</Div>
        )}
        <H2>Vulnerabilities</H2>
        {current.scan.violations?.length ? (
          <Table
            headers={['', 'Rule', 'Severity']}
            sizes={['40px', '80%', '15%']}
            background="fill-one"
            width="100%"
          >
            {current.scan.violations.map((vio, ind, arr) => (
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
      </Box>
    </Box>
  )
}
