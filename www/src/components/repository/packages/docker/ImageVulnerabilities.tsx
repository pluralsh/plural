import { useState } from 'react'
import { Collapsible } from 'grommet'
import { useOutletContext } from 'react-router-dom'
import {
  ArrowTopRightIcon,
  Chip,
  Codeline,
  CollapseIcon,
  DockerTagIcon,
  EmptyState,
  PageTitle,
} from '@pluralsh/design-system'
import capitalize from 'lodash/capitalize'
import styled, { useTheme } from 'styled-components'

import { Table, TableData, TableRow } from '../../../utils/Table'
import { AttackVector } from '../../../constants'
import { PackageGrade, chipSeverity } from '../misc'

const H3 = styled.h3(({ theme }) => ({
  margin: 0,
  ...theme.partials.text.overline,
  color: theme.colors['text-xlight'],
}))
const H4 = styled.h4(({ theme }) => ({
  margin: 0,
  ...theme.partials.text.body2Bold,
}))
const PBody2Light = styled.p(({ theme }) => ({
  margin: 0,
  ...theme.partials.text.body2,
  color: theme.colors['text-light'],
}))
const LinkOut = styled.a(({ theme }) => ({
  ...theme.partials.text.inlineLink,
  display: 'flex',
  alignItems: 'center',
  paddingRight: theme.spacing.small,
  gap: theme.spacing.xsmall,
}))

const CVSSRowSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: theme.spacing.small,
  gap: theme.spacing.xsmall,
  '.cvssRowContent': {
    display: 'flex',
    gap: theme.spacing.xsmall,
    flexWrap: 'wrap',
  },
}))

function CVSSRow({ text, value, options, colorMap }: any) {
  return (
    <CVSSRowSC>
      <H4>{text}</H4>
      <div className="cvssRowContent">
        {options.map(({ name, value: val }) => (
          <Chip
            key={name}
            severity={value === val ? colorMap[val] : null}
            size="small"
            fillLevel={3}
            css={{
              opacity: value === val ? 1 : 0.4,
            }}
          >
            {name}
          </Chip>
        ))}
      </div>
    </CVSSRowSC>
  )
}
const VulnerabilityDetailSC = styled.div<{ $last: boolean }>(
  ({ theme, $last: last }) => ({
    borderBottom: last ? undefined : '1px solid border',
    background: theme.colors['fill-two'],
    padding: `${theme.spacing.medium}px ${theme.spacing.large}px`,
    '.section': {
      display: 'flex',
      flex: '0 0 auto',
      flexDirection: 'column',
      gap: theme.spacing.small,
    },
    '.cvss': {
      display: 'flex',
      flex: '0 0 auto',
      flexDirection: 'column',
      gap: theme.spacing.small,
    },
    '.columns': {
      display: 'flex',
      gap: theme.spacing.medium,
      '& > *': {
        flexBasis: '50%',
      },
    },
  })
)

function VulnerabilityDetail({ v, last }: any) {
  const theme = useTheme()

  if (!v.title && !v.description && !v.source && !v.score && !v.cvss) {
    return (
      <VulnerabilityDetailSC $last={last}>
        No details available.
      </VulnerabilityDetailSC>
    )
  }

  return (
    <VulnerabilityDetailSC $last={last}>
      <div className="section">
        <H4>{v.title}</H4>
        <PBody2Light>{v.description}</PBody2Light>
      </div>
      <div className="section">
        {v.source && v.score && (
          <H4
            css={{
              marginTop: theme.spacing.large,
            }}
          >
            CVSS V3 Vector (source {v.source}, score: {v.score})
          </H4>
        )}
        {v.cvss && (
          <div className="cvss">
            <PBody2Light>
              Each metric is ordered from low to high severity.
            </PBody2Light>
            <div className="columns">
              <div>
                <H3>Exploitability metrics</H3>
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
                    PHYSICAL: 'success',
                    LOCAL: 'warning',
                    ADJACENT: 'error',
                    NETWORK: 'critical',
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
              </div>
              <div>
                <H3>Impact metrics</H3>
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
              </div>
            </div>
          </div>
        )}
      </div>
    </VulnerabilityDetailSC>
  )
}

function Vulnerability({ v, last }: any) {
  const [open, setOpen] = useState(false)

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
          {v.url ? (
            <LinkOut
              href={v.url}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{v.vulnerabilityId}</span>
              <ArrowTopRightIcon size={12} />
            </LinkOut>
          ) : (
            <span>{v.vulnerabilityId}</span>
          )}
        </TableData>
        <TableData>{v.package}</TableData>
        <TableData>{v.installedVersion}</TableData>
        <TableData>{v.fixedVersion}</TableData>
        <TableData>
          <Chip
            severity={chipSeverity[v.severity?.toLowerCase()]}
            fillLevel={2}
          >
            {capitalize(v.severity)}
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
    </div>
  )
}

const ImageVulnerabilitiesSC = styled.div(({ theme }) => {
  const mqDesktop =
    `@media (min-width: ${theme.breakpoints.desktop}px)` as const

  return {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    gap: theme.spacing.small,
    '.titleContent': {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.large,
      '.codeline': {
        maxWidth: 200,
        [mqDesktop]: {
          display: 'none',
        },
      },
    },
    '.content': {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      justifyContent: 'center',
    },
    '.table': {
      background: theme.colors['fill-one'],
      width: '100%',
      maxHeight: '100%',
      overflow: 'auto',
    },
  }
})

export default function ImageVulnerabilities() {
  const { image, imageName } = useOutletContext() as any
  const { vulnerabilities } = image

  return (
    <ImageVulnerabilitiesSC>
      <PageTitle heading="Vulnerabilities">
        <div className="titleContent">
          <PackageGrade
            grade={image.grade}
            large
          />
          <Codeline className="codeline">{`docker pull ${imageName}`}</Codeline>
        </div>
      </PageTitle>
      <div className="content">
        {vulnerabilities?.length ? (
          <Table
            headers={[
              '',
              'ID',
              'Package',
              'Version',
              'Fixed version',
              'Severity',
            ]}
            sizes={['5%', '20%', '20%', '20%', '20%', '15%']}
            className="table"
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
            icon={
              <DockerTagIcon
                size={64}
                color="text-primary-accent"
              />
            }
          />
        )}
      </div>
    </ImageVulnerabilitiesSC>
  )
}
