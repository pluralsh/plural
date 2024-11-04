import { useRef, useState } from 'react'

import lookup from 'country-code-lookup'
import { Box } from 'grommet'

import { Card, PageTitle, SubTab, TabList } from '@pluralsh/design-system'

import { Chloropleth } from '../utils/Chloropleth'

import {
  useAuditMetricsQuery,
  useLoginMetricsQuery,
} from '../../generated/graphql'

const DIRECTORY = [
  { key: 'audit-logs', label: 'Audit logs' },
  { key: 'logins', label: 'Logins' },
]

export function AuditChloropleth() {
  const [selectedKey, setSelectedKey] = useState<any>('audit-logs')
  const tabStateRef = useRef<any>(null)

  const query =
    selectedKey === 'logins' ? useLoginMetricsQuery : useAuditMetricsQuery
  const { data } = query({ fetchPolicy: 'cache-and-network' })

  if (!data) return null

  const results = data.auditMetrics || data.loginMetrics
  const metrics = results.map(({ country, count }) => ({
    // @ts-expect-error
    id: lookup.byIso(country).iso3,
    value: count,
  }))

  return (
    <Box fill>
      <PageTitle heading="Geodistribution">
        <TabList
          stateRef={tabStateRef}
          stateProps={{
            orientation: 'horizontal',
            selectedKey,
            onSelectionChange: setSelectedKey,
          }}
        >
          {DIRECTORY.map(({ label, key }) => (
            <SubTab
              key={key}
              textValue={label}
            >
              {label}
            </SubTab>
          ))}
        </TabList>
      </PageTitle>
      <Card
        height="450px"
        overflow="hidden"
        padding="medium"
      >
        <Chloropleth data={metrics} />
      </Card>
    </Box>
  )
}
