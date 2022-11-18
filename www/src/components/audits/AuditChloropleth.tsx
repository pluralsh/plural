import { useQuery } from '@apollo/client'
import { useRef, useState } from 'react'

import lookup from 'country-code-lookup'
import { Box } from 'grommet'

import { PageTitle, SubTab, TabList } from '@pluralsh/design-system'

import { Chloropleth } from '../utils/Chloropleth'

import { AUDIT_METRICS, LOGIN_METRICS } from './queries'

const DIRECTORY = [
  { key: 'audit-logs', label: 'Audit logs' },
  { key: 'logins', label: 'Logins' },
]

export function AuditChloropleth() {
  const [selectedKey, setSelectedKey] = useState('audit-logs')
  const tabStateRef = useRef<any>(null)

  const { data } = useQuery(selectedKey === 'logins' ? LOGIN_METRICS : AUDIT_METRICS, { fetchPolicy: 'cache-and-network' })

  if (!data) return null

  const results = data.auditMetrics || data.loginMetrics
  const metrics = results.map(({ country, count }) => ({
    // @ts-expect-error
    id: lookup.byIso(country).iso3, value: count,
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
      <Box
        fill
        round="xsmall"
        background="fill-one"
        overflow="hidden"
      >
        <Chloropleth data={metrics} />
      </Box>
    </Box>

  )
}
