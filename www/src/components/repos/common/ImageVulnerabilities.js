import { Box, Collapsible } from 'grommet'

import { useOutletContext } from 'react-router-dom'

import { useState } from 'react'

import {
  ArrowTopRightIcon, Chip, Codeline, CollapseIcon, DockerTagIcon, EmptyState, PageTitle,
} from 'pluralsh-design-system'

import { Table, TableData, TableRow } from 'components/utils/Table'

import {
  A, Flex, P, Span,
} from 'honorable'

import { capitalize } from 'lodash'

import { AttackVector } from '../constants'

import { PackageGrade, chipSeverity } from './misc'

function CVSSRow({
  text, value, options, colorMap,
}) {
  return (
    <Box
      direction="column"
      margin={{ top: 'small' }}
      gap="xsmall"
    >
      <P
        body2
        fontWeight={600}
      >
        {text}
      </P>
      <Box
        direction="row"
        gap="xsmall"
        wrap
      >
        {options.map(({ name, value: val }) => (
          <Chip
            key={name}
            severity={value === val ? colorMap[val] : null}
            size="small"
            backgroundColor="fill-three"
            borderColor="border-input"
            opacity={value === val ? 1 : 0.4}
            marginBottom="xxsmall"
          >
            {name}
          </Chip>
        ))}
      </Box>
    </Box>
  )
}

function VulnerabilityDetail({ v, last }) {
  if (!v.title && !v.description && !v.source && !v.score && !v.cvss) {
    return (
      <Box
        borderBottom={last ? null : '1px solid border'}
        background="fill-two"
        pad={{ horizontal: 'large', vertical: 'medium' }}
      >
        No details available.
      </Box>
    )
  }

  return (
    <Box
      direction="column"
      pad={{ horizontal: 'large', vertical: 'medium' }}
      gap="small"
      borderBottom={last ? null : '1px solid border'}
      background="fill-two"
      round={{ corner: 'bottom', size: '4px' }}
    >
      <Box
        flex={false}
        gap="small"
      >
        <P
          body2
          fontWeight={600}
        >
          {v.title}
        </P>
        <P
          body2
          color="text-light"
        >
          {v.description}
        </P>
      </Box>
      <Box
        flex={false}
        gap="small"
      >
        {v.source && v.score && (
          <P
            body2
            fontWeight={600}
            marginTop="large"
          >
            CVSS V3 Vector (source {v.source}, score: {v.score})
          </P>
        )}
        {v.cvss && (
          <Flex direction="column">
            <P
              body2
              color="text-light"
            >
              Each metric is ordered from low to high severity.
            </P>
            <Flex marginTop="large">
              <Box
                basis="1/2"
                margin={{ right: 'xsmall' }}
              >
                <P
                  overline
                  color="text-xlight"
                >
                  EXPLOITABILITY METRICS
                </P>
                <CVSSRow
                  text="Attack vector"
                  value={v.cvss.attackVector}
                  options={[
                    { name: 'Physical', value: AttackVector.PHYSICAL },
                    { name: 'Local', value: AttackVector.LOCAL },
                    { name: 'Adjacent Network', value: AttackVector.ADJACENT },
                    { name: 'Network', value: AttackVector.NETWORK },
                  ]}
                  colorMap={{
                    PHYSICAL: 'success', LOCAL: 'warning', ADJACENT: 'error', NETWORK: 'critical',
                  }}
                />
                <CVSSRow
                  text="Attack complexity"
                  value={v.cvss.attackComplexity}
                  options={[
                    { name: 'High', value: 'HIGH' },
                    { name: 'Low', value: 'LOW' },
                  ]}
                  colorMap={{ HIGH: 'warning', LOW: 'critical' }}
                />
                <CVSSRow
                  text="Privileges required"
                  value={v.cvss.privilegesRequired}
                  options={[
                    { name: 'High', value: 'HIGH' },
                    { name: 'Low', value: 'LOW' },
                    { name: 'None', value: 'NONE' },
                  ]}
                  colorMap={{ HIGH: 'warning', LOW: 'error', NONE: 'critical' }}
                />
                <CVSSRow
                  text="User interaction"
                  value={v.cvss.userInteraction}
                  options={[
                    { name: 'Required', value: 'REQUIRED' },
                    { name: 'None', value: 'NONE' },
                  ]}
                  colorMap={{ REQUIRED: 'warning', NONE: 'error' }}
                />
              </Box>
              <Box basis="1/2">
                <P
                  overline
                  color="text-xlight"
                >
                  IMPACT METRICS
                </P>
                <CVSSRow
                  text="Confidentiality"
                  value={v.cvss.confidentiality}
                  options={[
                    { name: 'None', value: 'NONE' },
                    { name: 'Low', value: 'LOW' },
                    { name: 'High', value: 'HIGH' },
                  ]}
                  colorMap={{ NONE: 'warning', LOW: 'error', HIGH: 'critical' }}
                />
                <CVSSRow
                  text="Integrity"
                  value={v.cvss.integrity}
                  options={[
                    { name: 'None', value: 'NONE' },
                    { name: 'Low', value: 'LOW' },
                    { name: 'High', value: 'HIGH' },
                  ]}
                  colorMap={{ NONE: 'warning', LOW: 'error', HIGH: 'critical' }}
                />
                <CVSSRow
                  text="Availability"
                  value={v.cvss.availability}
                  options={[
                    { name: 'None', value: 'NONE' },
                    { name: 'Low', value: 'LOW' },
                    { name: 'High', value: 'HIGH' },
                  ]}
                  colorMap={{ NONE: 'warning', LOW: 'error', HIGH: 'critical' }}
                />
              </Box>
            </Flex>
          </Flex>
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
                display="flex"
                alignItems="center"
              >
                <Span>{v.vulnerabilityId}</Span>
                <ArrowTopRightIcon
                  marginLeft="xsmall"
                  size={12}
                />
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
        <VulnerabilityDetail
          v={v}
          last={last}
        />
      </Collapsible>
    </Flex>
  )
}

export default function ImageVulnerabilities() {
  const { image, imageName } = useOutletContext()
  const { vulnerabilities } = image

  return (
    <Box
      fill
      flex={false}
      gap="small"
    >
      <PageTitle heading="Vulnerabilities">
        <Flex
          alignItems="center"
          gap="large"
        >
          <PackageGrade
            grade={image.grade}
            large
          />
          <Codeline
            maxWidth="200px"
            display-desktop-up="none"
          >
            {`docker pull ${imageName}`}
          </Codeline>
        </Flex>
      </PageTitle>
      <Box
        overflow={{ vertical: 'auto' }}
        pad={{ right: 'xsmall' }}
      >
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
          <EmptyState
            message="This package has no vulnerabilities."
            description="...and feels pretty damn good about it."
            icon={(
              <DockerTagIcon
                size="64px"
                color="text-primary-accent"
              />
            )}
          />
        )}
      </Box>
    </Box>
  )
}
