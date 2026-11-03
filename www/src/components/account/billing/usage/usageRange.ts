import moment from 'moment'

export type UsageRangeKey = '1W' | '1M' | '3M' | '6M'

export type UsageRange = {
  key: UsageRangeKey
  label: string
  days: number
}

export const USAGE_RANGES: UsageRange[] = [
  { key: '1W', label: '1W', days: 7 },
  { key: '1M', label: '1M', days: 30 },
  { key: '3M', label: '3M', days: 90 },
  { key: '6M', label: '6M', days: 180 },
]

export const DEFAULT_USAGE_RANGE = USAGE_RANGES[1]

export function parseUsageRange(param: Nullable<string>) {
  return (
    USAGE_RANGES.find(({ key }) => key === param?.toUpperCase()) ??
    DEFAULT_USAGE_RANGE
  )
}

export type UsagePoint = { date: Date; value: number }

type UsageBucket = { startTime?: Nullable<Date | string>; value: number }

// Stripe buckets usage by UTC day and may omit days with no events
export function dailyUsage(range: UsageRange, buckets: UsageBucket[]) {
  const byDay = new Map(
    buckets.map(({ startTime, value }) => [
      moment.utc(startTime).format('YYYY-MM-DD'),
      value,
    ])
  )
  const start = moment
    .utc()
    .startOf('day')
    .subtract(range.days - 1, 'days')

  return Array.from({ length: range.days }, (_, i): UsagePoint => {
    const day = start.clone().add(i, 'days')

    return {
      date: day.toDate(),
      value: byDay.get(day.format('YYYY-MM-DD')) ?? 0,
    }
  })
}
