import { ReactNode, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'
import moment from 'moment'

import { UsageMeter, useBillingUsageQuery } from '../../../../generated/graphql'
import { GqlError } from '../../../utils/Alert'
import LoadingIndicator from '../../../utils/LoadingIndicator'

import {
  SegmentedControl,
  USAGE_COLORS,
  UsageCard,
  UsageResourceRows,
} from './UsageBreakdown'
import { UsageChart } from './UsageChart'
import { formatBytes, formatQuantity } from './usageFormat'
import {
  USAGE_RANGES,
  UsageRangeKey,
  dailyUsage,
  parseUsageRange,
} from './usageRange'

export default function BillingUsage() {
  const theme = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const range = parseUsageRange(searchParams.get('range'))
  const startTime = useMemo(
    () =>
      moment
        .utc()
        .startOf('day')
        .subtract(range.days - 1, 'days')
        .toDate(),
    [range.days]
  )
  const { data, previousData, loading, error } = useBillingUsageQuery({
    variables: { startTime, meters: [UsageMeter.Ingest] },
    fetchPolicy: 'cache-and-network',
  })
  const usage = (data ?? previousData)?.billingUsage

  const ingest = usage?.meters?.find((m) => m?.meter === UsageMeter.Ingest)
  const daily = useMemo(
    () =>
      dailyUsage(
        range,
        (ingest?.buckets ?? []).filter((b) => !!b)
      ),
    [range, ingest]
  )
  const total = ingest?.total ?? 0

  const setRange = (key: UsageRangeKey) =>
    setSearchParams(
      (params) => {
        params.set('range', key)

        return params
      },
      { replace: true }
    )

  if (error && !usage) return <GqlError error={error} />
  if (!usage) return loading ? <LoadingIndicator /> : null

  const clusters = usage.clusterCount ?? 0
  const users = usage.userCount ?? 0

  return (
    <PageSC>
      <IntroSC>
        Usage as reported to Stripe for billing. Clusters are billed per
        cluster; users aren&apos;t billed today.
      </IntroSC>
      <StatsSC>
        <UsageStat
          label="Data ingested"
          value={formatBytes(total)}
          caption={`Last ${range.days} days`}
        />
        <UsageStat
          label="Daily ingest"
          value={formatBytes(total / range.days)}
          caption="Daily average"
        />
        <UsageStat
          label="Clusters"
          value={formatQuantity(clusters)}
          caption="Billed"
        />
        <UsageStat
          label="Users"
          value={formatQuantity(users)}
          caption="Not billed"
        />
      </StatsSC>
      <UsageCard
        title="Data ingested over time"
        caption={`${moment.utc(daily[0]?.date).format('MMM D')} – ${moment
          .utc(daily[daily.length - 1]?.date)
          .format('MMM D, YYYY')} · UTC days`}
        action={
          <SegmentedControl
            label="Range"
            options={USAGE_RANGES.map(({ key, label }) => ({
              value: key,
              label,
            }))}
            value={range.key}
            onChange={setRange}
          />
        }
      >
        <UsageChart
          id="ingest"
          label="Data ingested"
          total={total}
          daily={daily}
          format={formatBytes}
          color={theme.colors[USAGE_COLORS[0]]}
          height={280}
          ticks={6}
        />
      </UsageCard>
      <UsageCard
        title="Billable resources"
        caption="Current counts for your account"
      >
        <UsageResourceRows
          rows={[
            {
              key: 'clusters',
              label: 'Clusters',
              quantity: clusters,
              unit: clusters === 1 ? 'cluster' : 'clusters',
              billed: true,
            },
            {
              key: 'users',
              label: 'Users',
              quantity: users,
              unit: users === 1 ? 'user' : 'users',
              billed: false,
            },
          ]}
        />
      </UsageCard>
    </PageSC>
  )
}

function UsageStat({
  label,
  value,
  caption,
}: {
  label: string
  value: string
  caption: ReactNode
}) {
  return (
    <StatSC>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className="caption">{caption}</div>
    </StatSC>
  )
}

const PageSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.large,
  paddingBottom: theme.spacing.xlarge,
}))

const IntroSC = styled.p(({ theme }) => ({
  ...theme.partials.text.body1,
  margin: 0,
  color: theme.colors['text-long-form'],
}))

const StatsSC = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: theme.spacing.medium,
}))

const StatSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: theme.spacing.xsmall,
  minHeight: 128,
  padding: theme.spacing.large,
  borderRadius: theme.borderRadiuses.large,
  backgroundColor: theme.colors['fill-one'],
  '.label': {
    ...theme.partials.text.overline,
    color: theme.colors['text-xlight'],
  },
  '.value': {
    fontFamily: theme.fontFamilies.sans,
    fontSize: 36,
    fontWeight: 500,
    lineHeight: '32px',
    letterSpacing: '-0.25px',
    color: theme.colors.text,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  '.caption': {
    ...theme.partials.text.caption,
    color: theme.colors['text-xlight'],
  },
}))
