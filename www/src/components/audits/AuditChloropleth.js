import { useQuery } from '@apollo/client'
import { useState } from 'react'

import lookup from 'country-code-lookup'
import { Box } from 'grommet'
import { Button, ButtonGroup } from 'honorable'

import { PageTitle } from 'pluralsh-design-system'

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
      <PageTitle
        heading="Audit logs"
        fontFamily="Monument Semi-Mono, monospace"
      >
        <ButtonGroup style={{ border: '0px' }}>
          <Button
            tertiary
            background={tab === 'Audit logs' ? 'fill-one' : ''}
            onClick={() => setTab('Audit logs')}
          >
            Audit logs
          </Button>
          <Button
            tertiary
            background={tab === 'Logins' ? 'fill-one' : ''}
            onClick={() => setTab('Logins')}
            style={{ border: '0px' }}
          >
            Logins
          </Button>
        </ButtonGroup>
      </PageTitle>
      <Box
        fill
        round="xsmall"
        background="fill-one"
      >
        <Chloropleth data={metrics} />
      </Box>
    </Box>

  )
}
