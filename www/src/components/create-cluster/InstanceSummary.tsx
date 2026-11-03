import moment from 'moment'
import styled from 'styled-components'

import {
  CloudProvider,
  ConsoleInstanceFragment,
  ConsoleInstanceType,
} from 'generated/graphql'

const CLOUD_LABELS: Partial<Record<CloudProvider, string>> = {
  [CloudProvider.Aws]: 'AWS',
}

const TYPE_LABELS: Record<ConsoleInstanceType, string> = {
  [ConsoleInstanceType.Shared]: 'Shared',
  [ConsoleInstanceType.Dedicated]: 'Dedicated',
}

export function InstanceHeader({
  name,
  running,
}: {
  name: string
  running: boolean
}) {
  return (
    <HeaderSC>
      <span className="name">{name}</span>
      <InstanceStatus running={running} />
    </HeaderSC>
  )
}

export function InstanceStatus({ running }: { running: boolean }) {
  return (
    <StatusSC $running={running}>
      {running ? 'Running' : 'Provisioning'}
    </StatusSC>
  )
}

export function InstanceSummary({
  instance,
}: {
  instance: Nullable<ConsoleInstanceFragment>
}) {
  if (!instance) return null

  const items = [
    {
      label: 'Hosting',
      value: `Plural Cloud · ${TYPE_LABELS[instance.type]}`,
    },
    {
      label: 'Provider',
      value: CLOUD_LABELS[instance.cloud] ?? instance.cloud,
    },
    { label: 'Region', value: instance.region, mono: true },
    {
      label: 'Created',
      value: instance.insertedAt
        ? moment(instance.insertedAt).format('MMM D, YYYY')
        : 'Just now',
    },
  ]

  return (
    <SummarySC $columns={items.length}>
      {items.map(({ label, value, mono }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd className={mono ? 'mono' : undefined}>{value}</dd>
        </div>
      ))}
    </SummarySC>
  )
}

const HeaderSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing.medium,
  '.name': { ...theme.partials.text.body1Bold, color: theme.colors.text },
}))

const StatusSC = styled.span<{ $running: boolean }>(({ theme, $running }) => {
  const color = $running
    ? theme.colors['text-success-light']
    : theme.colors['text-warning-light']

  return {
    ...theme.partials.text.caption,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 8px',
    borderRadius: theme.borderRadiuses.medium,
    color,
    border: theme.borders['fill-two'],
    backgroundColor: theme.colors['fill-two'],
    '&::before': {
      content: '""',
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: color,
    },
  }
})

const SummarySC = styled.dl<{ $columns: number }>(({ theme, $columns }) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${$columns}, minmax(0, 1fr))`,
  gap: theme.spacing.medium,
  margin: 0,
  padding: `${theme.spacing.medium} 0`,
  borderTop: theme.borders.default,
  borderBottom: theme.borders.default,
  dt: {
    ...theme.partials.text.caption,
    color: theme.colors['text-xlight'],
    marginBottom: theme.spacing.xxsmall,
  },
  dd: {
    ...theme.partials.text.body2,
    margin: 0,
    color: theme.colors.text,
    overflowWrap: 'anywhere',
  },
  '.mono': theme.partials.text.mono,
}))
