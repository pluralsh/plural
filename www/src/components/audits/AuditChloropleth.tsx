import lookup from 'country-code-lookup'
import { Card, Flex } from '@pluralsh/design-system'
import { useMemo } from 'react'
import { useTheme } from 'styled-components'

import { useAuditMetricsQuery } from '../../generated/graphql'
import { Chloropleth } from '../utils/Chloropleth'
import { SubpageHeader } from '../utils/layout/SubpageLayout'

export function AuditChloropleth() {
  const theme = useTheme()
  const { data } = useAuditMetricsQuery({ fetchPolicy: 'cache-and-network' })
  const metrics = useMemo(
    () =>
      (data?.auditMetrics ?? []).map((metric) => ({
        id: lookup.byIso(metric?.country ?? '')?.iso3,
        value: metric?.count,
      })),
    [data]
  )

  if (!data) return null

  return (
    <Flex
      direction="column"
      width="100%"
      height="100%"
    >
      <SubpageHeader title="Geodistribution" />
      <Card
        height="450px"
        overflow="hidden"
        css={{ padding: theme.spacing.medium }}
      >
        <Chloropleth data={metrics} />
      </Card>
    </Flex>
  )
}
