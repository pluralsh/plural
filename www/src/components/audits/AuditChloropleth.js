import { useQuery } from '@apollo/client'
import { useState } from 'react'

import lookup from 'country-code-lookup'
import { Box } from 'grommet'
import { Flex } from 'honorable'

import { PageTitle, SubTab } from 'pluralsh-design-system'

import { Chloropleth } from '../utils/Chloropleth'

import { AUDIT_METRICS, LOGIN_METRICS } from './queries'

export function AuditChloropleth() {
  const [tab, setTab] = useState('Audit logs')
  const { data } = useQuery(tab === 'Logins' ? LOGIN_METRICS : AUDIT_METRICS, { fetchPolicy: 'cache-and-network' })

  if (!data) return null

  const results = data.auditMetrics || data.loginMetrics
  const metrics = results.map(({ country, count }) => ({
    id: lookup.byIso(country).iso3, value: count,
  }))

  return (
    <Box fill>
      <PageTitle heading="Geodistribution">
        <Flex>
          <SubTab
            active={tab === 'Audit logs'}
            onClick={() => setTab('Audit logs')}
          >
            Audit logs
          </SubTab>
          <SubTab
            active={tab === 'Logins'}
            onClick={() => setTab('Logins')}
          >
            Logins
          </SubTab>
        </Flex>
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
