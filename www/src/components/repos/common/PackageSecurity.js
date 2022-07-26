import { useState } from 'react'
import { Box, Collapsible } from 'grommet'
import { Chip, CollapseIcon, ErrorIcon } from 'pluralsh-design-system'

import { Button, Div, H2, Span } from 'honorable'

import Clamp from 'react-multiline-clamp'

import { useOutletContext } from 'react-router-dom'

import { capitalize } from 'lodash/string'

import { Table, TableData, TableRow } from '../../utils/Table'

import { PackageGrade, PackageProperty, PackageViewHeader } from './misc'

const chipSeverity = {
  low: 'success',
  medium: 'warning',
  high: 'error',
}

function ScanViolation({ violation, last }) {
  const [open, setOpen] = useState(false)

  return (
    <Box>
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
    </Box>
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
      <PackageViewHeader title="Security">{
        current?.scan && (
          <PackageGrade
            scan={current.scan}
            large
          />
        )
      }
      </PackageViewHeader>
      <H2>Scan failures</H2>
      {current.scan.errors?.length ? (
        <Box
          background="fill-one"
          border
          round="xsmall"
        >
          {current.scan.errors.map((error, i, arr) => (
            <Box
              key={i}
              direction="row"
              align="center"
              gap="medium"
              pad={{ horizontal: 'medium', vertical: 'small' }}
              border={i === arr.length - 1 ? null : 'bottom'}
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
                    marginLeft="medium"
                    onClick={toggle}
                  >
                    Read more
                  </Button>
                )}
                showLessElement={({ toggle }) => (
                  <Button
                    secondary
                    height="40px"
                    onClick={toggle}
                  >
                    Hide
                  </Button>
                )}
              >
                <p>{error.message}</p>
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
          height="calc(100% - 16px)"
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
  )
}
