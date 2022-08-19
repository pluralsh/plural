import { Box, Collapsible, Text } from 'grommet'

import { useOutletContext } from 'react-router-dom'

import { useState } from 'react'

import {
  ArrowTopRightIcon, Chip, CollapseIcon, PageTitle,
} from 'pluralsh-design-system'

import { Table, TableData, TableRow } from 'components/utils/Table'

import {
  A, Div, Flex, Span,
} from 'honorable'

import { capitalize } from 'lodash'

import { AttackVector, ColorMap } from '../constants'

import { PackageGrade, chipSeverity } from './misc'

function VectorSection({ text, background }) {
  return (
    <Box
      pad={{ vertical: 'xsmall' }}
      width="150px"
      background="fill-one"
      align="center"
      justify="center"
      border={background && { side: 'bottom', size: '3px', color: background }}
    >
      <Text size="small">{text}</Text>
    </Box>
  )
}

function CVSSRow({
  text, value, options, colorMap,
}) {
  return (
    <Box
      direction="row"
      align="center"
    >
      <Box
        width="150px"
        flex={false}
      >
        <Text
          size="small"
          weight={500}
        >
          {text}
        </Text>
      </Box>
      <Box
        direction="row"
        fill="horizontal"
        gap="xsmall"
      >
        {options.map(({ name, value: val }) => (
          <VectorSection
            key={name}
            background={value === val ? colorMap[val] : null}
            text={name}
          />
        ))}
      </Box>
    </Box>
  )
}

function VulnerabilityDetail({ vuln }) {
  return (
    <Box
      flex={false}
      pad="small"
      gap="medium"
    >
      <Box
        flex={false}
        gap="small"
      >
        <Text
          size="small"
          weight={500}
        >{vuln.title}
        </Text>
        <Text size="small">{vuln.description}</Text>
      </Box>
      <Box
        flex={false}
        gap="small"
      >
        <Box
          direction="row"
          gap="xsmall"
        >
          <Text
            size="small"
            weight={500}
          >CVSS V3 Vector
          </Text>
          <Text size="small">(source {vuln.source}, score: <b>{vuln.score}</b>)</Text>
        </Box>
        {vuln.cvss && (
          <Box
            flex={false}
            gap="small"
          >
            <Text
              size="small"
              weight={500}
            >EXPLOITABILITY METRICS
            </Text>
            <Box
              flex={false}
              gap="xsmall"
            >
              <CVSSRow
                text="Attack Vector"
                value={vuln.cvss.attackVector}
                options={[
                  { name: 'Physical', value: AttackVector.PHYSICAL },
                  { name: 'Local', value: AttackVector.LOCAL },
                  { name: 'Adjacent Network', value: AttackVector.ADJACENT },
                  { name: 'Network', value: AttackVector.NETWORK },
                ]}
                colorMap={ColorMap}
              />
              <CVSSRow
                text="Attack Complexity"
                value={vuln.cvss.attackComplexity}
                options={[
                  { name: 'High', value: 'HIGH' },
                  { name: 'Low', value: 'LOW' },
                ]}
                colorMap={{ HIGH: 'low', LOW: 'high' }}
              />
              <CVSSRow
                text="Privileges Required"
                value={vuln.cvss.privilegesRequired}
                options={[
                  { name: 'High', value: 'HIGH' },
                  { name: 'Low', value: 'LOW' },
                  { name: 'None', value: 'NONE' },
                ]}
                colorMap={{ HIGH: 'low', LOW: 'high', NONE: 'critical' }}
              />
              <CVSSRow
                text="User Interaction"
                value={vuln.cvss.userInteraction}
                options={[
                  { name: 'Required', value: 'REQUIRED' },
                  { name: 'None', value: 'NONE' },
                ]}
                colorMap={{ REQUIRED: 'low', NONE: 'high' }}
              />
            </Box>
            <Text
              size="small"
              weight={500}
            >IMPACT METRICS
            </Text>
            <Box
              flex={false}
              gap="xsmall"
            >
              <CVSSRow
                text="Confidentiality"
                value={vuln.cvss.confidentiality}
                options={[
                  { name: 'None', value: 'NONE' },
                  { name: 'Low', value: 'LOW' },
                  { name: 'High', value: 'HIGH' },
                ]}
                colorMap={{ NONE: 'low', LOW: 'medium', HIGH: 'high' }}
              />
              <CVSSRow
                text="Integrity"
                value={vuln.cvss.integrity}
                options={[
                  { name: 'None', value: 'NONE' },
                  { name: 'Low', value: 'LOW' },
                  { name: 'High', value: 'HIGH' },
                ]}
                colorMap={{ NONE: 'low', LOW: 'medium', HIGH: 'high' }}
              />
              <CVSSRow
                text="Availability"
                value={vuln.cvss.availability}
                options={[
                  { name: 'None', value: 'NONE' },
                  { name: 'Low', value: 'LOW' },
                  { name: 'High', value: 'HIGH' },
                ]}
                colorMap={{ NONE: 'low', LOW: 'medium', HIGH: 'high' }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

function Vulnerability({ v, last }) {
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
        <TableData>
          {v.url ? (
            <Box direction="row">
              <A
                inline
                href={v.url}
                onClick={e => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Span>{v.vulnerabilityId}</Span>
                <ArrowTopRightIcon marginLeft="xxsmall" />
              </A>
            </Box>
          ) : <Span>{v.vulnerabilityId}</Span>}
        </TableData>
        <TableData>{v.package}</TableData>
        <TableData>{v.installedVersion}</TableData>
        <TableData>{v.fixedVersion}</TableData>
        <TableData>
          <Chip
            severity={chipSeverity[v.severity?.toLowerCase()]}
            backgroundColor="fill-two"
            borderColor="border-fill-two"
          >
            <Span fontWeight="600">{capitalize(v.severity)}</Span>
          </Chip>
        </TableData>
      </TableRow>
      <Collapsible
        open={open}
        direction="vertical"
      >
        <VulnerabilityDetail vuln={v} />
      </Collapsible>
    </Flex>
  )
}

export default function ImageVulnerabilities() {
  const { image } = useOutletContext()
  const { vulnerabilities } = image

  return (
    <Box
      style={{ overflow: 'auto' }}
      fill
    >
      <PageTitle heading="Vulnerabilities">
        <PackageGrade
          grade={image.grade}
          large
        />
      </PageTitle>
      {vulnerabilities?.length ? (
        <Table
          headers={['', 'ID', 'Package', 'Version', 'Fixed version', 'Severity']}
          sizes={['5%', '20%', '20%', '20%', '20%', '15%']}
          background="fill-one"
          width="100%"
        >
          {vulnerabilities.map((v, ind, arr) => (
            <Vulnerability
              key={v.id}
              v={v}
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
