import { Chip } from '@pluralsh/design-system'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { Tone } from '../../../utils/tone'

import { formatQuantity } from './usageFormat'

export const USAGE_COLORS: Tone[] = [
  'graph-blue',
  'graph-green',
  'graph-lilac',
  'graph-red',
]

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <SegmentedSC
      role="radiogroup"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </SegmentedSC>
  )
}

export function UsageCard({
  title,
  caption,
  action,
  children,
}: {
  title: string
  caption?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <CardSC>
      <CardHeaderSC>
        <div>
          <div className="title">{title}</div>
          {caption && <div className="caption">{caption}</div>}
        </div>
        {action}
      </CardHeaderSC>
      {children}
    </CardSC>
  )
}

export type UsageResource = {
  key: string
  label: string
  quantity: number
  unit: string
  billed: boolean
}

export function UsageResourceRows({ rows }: { rows: UsageResource[] }) {
  return (
    <ResourceRowsSC>
      {rows.map((row) => (
        <div
          key={row.key}
          className="row"
        >
          <span className="label">{row.label}</span>
          <span className="quantity">
            {formatQuantity(row.quantity)} {row.unit}
          </span>
          <Chip
            size="small"
            severity={row.billed ? 'info' : 'neutral'}
          >
            {row.billed ? 'Billed' : 'Not billed'}
          </Chip>
        </div>
      ))}
    </ResourceRowsSC>
  )
}

const SegmentedSC = styled.div(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing.xxsmall,
  height: 40,
  padding: '2px 4px',
  borderRadius: 4,
  border: theme.borders.default,
  backgroundColor: theme.colors['fill-zero'],
  button: {
    ...theme.partials.text.caption,
    fontWeight: 600,
    minWidth: 32,
    height: 32,
    padding: '0 8px',
    border: 'none',
    borderRadius: 3,
    background: 'none',
    color: theme.colors['text-light'],
    cursor: 'pointer',
    '&:hover': { color: theme.colors.text },
    '&:focus-visible': { outline: theme.borders['outline-focused'] },
    '&[aria-checked="true"]': {
      backgroundColor: theme.colors['fill-three'],
      color: theme.colors.text,
    },
  },
}))

const CardSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.large,
  minWidth: 0,
  padding: theme.spacing.large,
  borderRadius: theme.borderRadiuses.large,
  border: theme.borders.default,
  backgroundColor: theme.colors['fill-zero'],
}))

const CardHeaderSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing.medium,
  flexWrap: 'wrap',
  '.title': { ...theme.partials.text.body1, color: theme.colors.text },
  '.caption': {
    ...theme.partials.text.caption,
    color: theme.colors['text-xlight'],
  },
}))

const ResourceRowsSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  '.row': {
    ...theme.partials.text.body2,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto 96px',
    alignItems: 'center',
    gap: theme.spacing.medium,
    padding: '12px 0',
    borderBottom: theme.borders.default,
    fontVariantNumeric: 'tabular-nums',
    '&:last-child': { borderBottom: 'none' },
    '> :last-child': { justifySelf: 'end' },
  },
  '.label': { color: theme.colors.text },
  '.quantity': { color: theme.colors['text-light'] },
}))
