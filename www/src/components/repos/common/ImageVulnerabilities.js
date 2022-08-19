import {
  Anchor, Box, Collapsible, Text,
} from 'grommet'

import { useOutletContext } from 'react-router-dom'

import { useState } from 'react'
import { Links } from 'forge-core'

import { HeaderItem } from 'components/utils/Header'

import { AttackVector, ColorMap } from '../constants'

function NoVulnerabilities() {
  return (
    <Box
      fill
      justify="center"
      align="center"
    >
      <Text weight="bold">This image is vulnerability free</Text>
    </Box>
  )
}

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

function Vulnerability({ vuln }) {
  const [open, setOpen] = useState(false)

  return (
    <Box
      flex={false}
      border={{ side: 'bottom', color: 'border' }}
    >
      <Box
        direction="row"
        gap="small"
        align="center"
        pad="xsmall"
        onClick={() => setOpen(!open)}
        hoverIndicator="fill-one"
        focusIndicator={false}
      >
        <Box
          width="30%"
          direction="row"
          gap="small"
        >
          <Text
            size="small"
            weight={500}
          >{vuln.vulnerabilityId}
          </Text>
          {vuln.url && (
            <Anchor
              size="small"
              href={vuln.url}
              target="_blank"
            ><Links size="small" />
            </Anchor>
          )}
        </Box>
        <Box
          flex={false}
          width="15%"
          direction="row"
          gap="xsmall"
          align="center"
        >
          <Box
            width="15px"
            height="15px"
            round="xsmall"
            background={ColorMap[vuln.severity]}
          />
          <Text size="small">{vuln.severity}</Text>
        </Box>
        <HeaderItem
          text={vuln.package}
          width="25%"
          nobold
        />
        <HeaderItem
          text={vuln.installedVersion}
          width="15%"
          nobold
        />
        <HeaderItem
          text={vuln.fixedVersion}
          width="15%"
          nobold
        />
      </Box>
      <Collapsible open={open}>
        <VulnerabilityDetail vuln={vuln} />
      </Collapsible>
    </Box>
  )
}

function VulnerabilityHeader() {
  return (
    <Box
      flex={false}
      direction="row"
      pad="xsmall"
      border={{ side: 'bottom', color: 'border' }}
      align="center"
    >
      <HeaderItem
        text="ID"
        width="30%"
      />
      <HeaderItem
        text="Severity"
        width="15%"
      />
      <HeaderItem
        text="Package"
        width="25%"
      />
      <HeaderItem
        text="Version"
        width="15%"
      />
      <HeaderItem
        text="Fixed Version"
        width="15%"
      />
    </Box>
  )
}

export default function ImageVulnerabilities() {
  const { image: { vulnerabilities } } = useOutletContext()

  if (!vulnerabilities || vulnerabilities.length === 0) return <NoVulnerabilities />

  return (
    <Box
      style={{ overflow: 'auto' }}
      fill
    >
      <VulnerabilityHeader />
      {vulnerabilities.map(vuln => (
        <Vulnerability
          key={vuln.id}
          vuln={vuln}
        />
      ))}
    </Box>
  )
}
