import { useContext, useState } from 'react'
import { Box, Collapsible, Text } from 'grommet'
import { ErrorIcon } from 'pluralsh-design-system'

import { Button, Div, H2 } from 'honorable'

import Clamp from 'react-multiline-clamp'

import ChartContext from '../../../contexts/ChartContext'

import { GradeNub, HeaderItem } from '../Docker'

import { PackageGrade, PackageViewHeader } from './misc'

const ROW_HEIGHT = 40
const ROW_HEIGHT_PX = `${ROW_HEIGHT}px`

function ScanHeader() {
  return (
    <Box
      direction="row"
      fill="horizontal"
      gap="xsmall"
      align="center"
      pad="small"
      border={{ side: 'bottom', color: 'border' }}
      height={ROW_HEIGHT_PX}
    >
      <HeaderItem
        text="Rule"
        width="15%"
      />
      <HeaderItem
        text="Severity"
        width="25%"
      />
      <HeaderItem
        text="Location"
        width="30%"
      />
      <HeaderItem
        text="Resource"
        width="30%"
      />
    </Box>
  )
}

function ScanViolation({ violation }) {
  const [open, setOpen] = useState(false)

  return (
    <Box flex={false}>
      <Box
        direction="row"
        fill="horizontal"
        gap="xsmall"
        align="center"
        pad="small"
        border={{ side: 'bottom' }}
        height={ROW_HEIGHT_PX}
        hoverIndicator="fill-one"
        onClick={() => setOpen(!open)}
      >
        <HeaderItem
          text={violation.ruleId}
          width="15%"
          nobold
        />
        <Box
          flex={false}
          width="25%"
        >
          <GradeNub
            text={violation.severity.toLowerCase()}
            severity={violation.severity}
          />
        </Box>
        <HeaderItem
          text={`${violation.file}:${violation.line}`}
          width="30%"
          truncate
          nobold
        />
        <HeaderItem
          text={`${violation.resourceType}.${violation.resourceName}`}
          width="30%"
          nobold
        />
      </Box>
      <Collapsible
        open={open}
        direction="vertical"
      >
        <Box
          flex={false}
          fill="horizontal"
          pad="small"
          gap="small"
        >
          <Box
            direction="row"
            gap="xsmall"
            align="center"
          >
            <Text
              size="small"
              weight={500}
            >{violation.ruleId}
            </Text>
            <Text size="small">{violation.ruleName}</Text>
          </Box>
          <Text size="small">{violation.description}</Text>
          <Text size="small">occurred on {violation.file}:{violation.line}</Text>
        </Box>
      </Collapsible>
    </Box>
  )
}

export default function PackageSecurity() {
  const { currentHelmChart, currentTerraformChart } = useContext(ChartContext)
  const current = currentHelmChart || currentTerraformChart

  return (
    <Box
      fill
      flex={false}
      pad="medium"
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
      {current.scan.errors && (
        <Box gap="small">
          <H2>Scan failures</H2>
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

        </Box>
      )}
      <H2>Vunerabilities</H2>
      {current.scan.violations?.length ? (
        <Box>
          <ScanHeader />
          <Box flex={false}>
            {current.scan.violations.map((vio, ind) => (
              <ScanViolation
                key={`${ind}`}
                violation={vio}
              />
            ))}
          </Box>
        </Box>
      ) : (
        <Div body1>No vunerabilities found.</Div>
      )}
    </Box>
  )
}
