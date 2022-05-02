import { useState } from 'react'
import { Box, Collapsible, Text } from 'grommet'
import { Alert } from 'pluralsh-design-system'

import { GradeNub, HeaderItem } from './Docker'

const ROW_HEIGHT = 40
const ROW_HEIGHT_PX = `${ROW_HEIGHT}px`

export function PackageGrade({ scan }) {
  if (!scan) return null

  return (
    <GradeNub
      text={scan.grade}
      severity={scan.grade}
    />
  )
}

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
        border={{ side: 'bottom', color: 'tone-light' }}
        height={ROW_HEIGHT_PX}
        hoverIndicator="tone-light"
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

export function ScanResults({ scan: { errors, violations } }) {
  return (
    <Box fill>
      {errors && (
        <Box
          fill
          gap="small"
          pad={{ vertical: 'small' }}
        >
          {errors.map((error, ind) => (
            <Alert
              key={ind}
              title="Scan failure"
              severity="error"
            >
              {error.message}
            </Alert>
          ))}
        </Box>
      )}
      <ScanHeader />
      {violations.map((vio, ind) => (
        <ScanViolation
          key={`${ind}`}
          violation={vio}
        />
      ))}
    </Box>
  )
}
