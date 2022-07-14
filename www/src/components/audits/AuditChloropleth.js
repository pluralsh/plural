import { useQuery } from '@apollo/client'
import { useState } from 'react'

import lookup from 'country-code-lookup'
import { Box } from 'grommet'
import { Div } from 'honorable'

import { ButtonGroup } from '../utils/ButtonGroup'
import { Chloropleth } from '../utils/Chloropleth'

import { AUDIT_METRICS, LOGIN_METRICS } from './queries'

export function AuditChloropleth() {
  const [tab, setTab] = useState('Audits')
  const { data } = useQuery(tab === 'Logins' ? LOGIN_METRICS : AUDIT_METRICS, { fetchPolicy: 'cache-and-network' })
  
  if (!data) return null
  
  const results = data.auditMetrics || data.loginMetrics
  const metrics = results.map(({ country, count }) => ({
    id: lookup.byIso(country).iso3, value: count,
  }))
  
  return (
    <Box
      fill
      gap="medium"
    >
      <Div
        width="150px"
        fontFamily="Monument Semi-Mono, monospace"
      >
        <ButtonGroup
          tabs={['Audits', 'Logins']}
          default={tab}
          onChange={setTab}
        />
      </Div>
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
