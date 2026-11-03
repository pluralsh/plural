import {
  Button,
  CalendarIcon,
  KeyIcon,
  LightningIcon,
} from '@pluralsh/design-system'
import moment, { Moment } from 'moment'
import { ReactNode, useState } from 'react'
import styled from 'styled-components'

import {
  PaymentPeriod,
  useGenerateLicenseKeyLazyQuery,
  useSubscriptionBillingPeriodQuery,
} from '../../../generated/graphql'
import { GqlError } from '../../utils/Alert'

import BillingDowngradeModal from './BillingDowngradeModal'
import { useBillingSubscription } from './BillingSubscriptionProvider'
import { LicenseKeyModal } from './LicenseKeyModal'

const RING_SIZE = 28
const RING_STROKE = 2
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const ENDING_SOON_DAYS = 7

type Cycle = { start: Moment; end: Moment }

type BillingDetail = {
  value: string
  label: string
  cycle?: Cycle
}

function periodUnit(period: Nullable<PaymentPeriod>) {
  return period === PaymentPeriod.Yearly ? 'years' : 'months'
}

function nextBillingDate(start: Moment, period: Nullable<PaymentPeriod>) {
  const unit = periodUnit(period)
  const elapsed = Math.max(moment.utc().diff(start, unit), 0)
  const next = start.clone().add(elapsed, unit)

  return next.isAfter(moment.utc(), 'day') ? next : next.add(1, unit)
}

function cycleProgress({ start, end }: Cycle) {
  const now = moment.utc()
  const length = Math.max(end.diff(start), 1)

  return {
    progress: Math.min(Math.max(now.diff(start) / length, 0), 1),
    daysLeft: Math.max(end.diff(now.clone().startOf('day'), 'days'), 0),
  }
}

function formatDaysLeft(days: number) {
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'

  return `in ${days} days`
}

function useBillingDetail(): BillingDetail | null {
  const { subscription, isTrialPlan, isProPlan, isEnterprisePlan } =
    useBillingSubscription()
  const insertedAt = subscription?.insertedAt
  // Stripe opens a new invoice at the start of each billing period, unlike insertedAt which keeps the trial's creation date.
  const { data: periodData } = useSubscriptionBillingPeriodQuery({
    skip: !isProPlan,
    errorPolicy: 'all',
  })
  const periodStart =
    periodData?.account?.subscription?.latestInvoice?.createdAt

  if (isTrialPlan && subscription?.trialUntil) {
    const end = moment.utc(subscription.trialUntil)

    return {
      value: end.format('MMM D, YYYY'),
      label: 'Trial ends',
      cycle: insertedAt ? { start: moment.utc(insertedAt), end } : undefined,
    }
  }

  if (isEnterprisePlan) return null

  if (isProPlan) {
    if (!periodStart) return null

    const period = subscription?.plan?.period
    const end = nextBillingDate(moment.utc(periodStart), period)

    return {
      value: end.format('MMM D, YYYY'),
      label: 'Next billing date',
      cycle: { start: end.clone().subtract(1, periodUnit(period)), end },
    }
  }

  return { value: 'No upcoming charges', label: 'Billing' }
}

export function BillingPlanActions() {
  const { isProPlan, isEnterprisePlan } = useBillingSubscription()
  const [downgradeOpen, setDowngradeOpen] = useState(false)
  const [licenseKey, setLicenseKey] = useState('')
  const [licenseKeyOpen, setLicenseKeyOpen] = useState(false)
  const [generateLicenseKey, { loading, error }] =
    useGenerateLicenseKeyLazyQuery({
      onCompleted: (data) => {
        setLicenseKey(data.licenseKey ?? '')
        setLicenseKeyOpen(true)
      },
    })

  return (
    <>
      {error && <GqlError error={error} />}
      {isEnterprisePlan && (
        <Button
          secondary
          small
          startIcon={<KeyIcon />}
          loading={loading}
          onClick={() => generateLicenseKey()}
        >
          Generate license key
        </Button>
      )}
      {isProPlan && (
        <Button
          secondary
          small
          onClick={() => setDowngradeOpen(true)}
        >
          Cancel plan
        </Button>
      )}
      <LicenseKeyModal
        licenseKey={licenseKey}
        open={licenseKeyOpen}
        onOpenChange={setLicenseKeyOpen}
      />
      <BillingDowngradeModal
        open={downgradeOpen}
        onClose={() => setDowngradeOpen(false)}
      />
    </>
  )
}

export function BillingPlanSummary() {
  const { subscription } = useBillingSubscription()
  const detail = useBillingDetail()
  const cycle = detail?.cycle && cycleProgress(detail.cycle)

  return (
    <SummarySC>
      <SummaryDetail
        icon={<LightningIcon size={14} />}
        value={`${subscription?.plan?.name ?? 'Free'} plan`}
        label="Current plan"
      />
      {detail && (
        <>
          <SummaryDividerSC />
          <SummaryDetail
            icon={<CalendarIcon size={14} />}
            value={detail.value}
            label={
              cycle
                ? `${detail.label} · ${formatDaysLeft(cycle.daysLeft)}`
                : detail.label
            }
            progress={cycle?.progress}
            soon={!!cycle && cycle.daysLeft <= ENDING_SOON_DAYS}
          />
        </>
      )}
    </SummarySC>
  )
}

function SummaryDetail({
  icon,
  value,
  label,
  progress,
  soon = false,
}: {
  icon: ReactNode
  value: string
  label: string
  progress?: number
  soon?: boolean
}) {
  const hasRing = progress !== undefined

  return (
    <SummaryDetailSC
      $ring={hasRing}
      $soon={soon}
    >
      <div className="icon">
        {hasRing && (
          <svg
            className="ring"
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            role="progressbar"
            aria-label="Billing cycle elapsed"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <circle
              className="track"
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
            />
            <circle
              className="progress"
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
            />
          </svg>
        )}
        {icon}
      </div>
      <div>
        <div className="value">{value}</div>
        <div className="label">{label}</div>
      </div>
    </SummaryDetailSC>
  )
}

export const PlanColumnsSC = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: theme.spacing.xlarge,
}))

const SummarySC = styled.div(({ theme }) => ({
  display: 'flex',
  minWidth: 0,
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing.large,
  padding: `${theme.spacing.small} ${theme.spacing.medium}`,
  borderRadius: theme.borderRadiuses.large,
  border: theme.borders.default,
  backgroundColor: theme.colors['fill-one'],
}))

const SummaryDividerSC = styled.div(({ theme }) => ({
  alignSelf: 'stretch',
  width: 1,
  backgroundColor: theme.colors.border,
}))

const SummaryDetailSC = styled.div<{ $ring: boolean; $soon: boolean }>(
  ({ theme, $ring, $soon }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.small,
    '.icon': {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: RING_SIZE,
      height: RING_SIZE,
      borderRadius: '50%',
      border: $ring ? 'none' : theme.borders.input,
      color: $soon
        ? theme.colors['icon-warning']
        : theme.colors['icon-default'],
    },
    '.ring': {
      position: 'absolute',
      inset: 0,
      transform: 'rotate(-90deg)',
      fill: 'none',
      strokeWidth: RING_STROKE,
    },
    '.track': { stroke: theme.colors.border },
    '.progress': {
      stroke: $soon
        ? theme.colors['icon-warning']
        : theme.colors['border-primary'],
      strokeLinecap: 'round',
    },
    '.value': { ...theme.partials.text.body2Bold, color: theme.colors.text },
    '.label': {
      ...theme.partials.text.caption,
      color: theme.colors['text-xlight'],
    },
  })
)
