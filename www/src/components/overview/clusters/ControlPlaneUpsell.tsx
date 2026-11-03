import { WarningIcon } from '@pluralsh/design-system'
import { useBillingSubscription } from 'components/account/billing/BillingSubscriptionProvider'
import moment, { type Moment } from 'moment'
import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import ConsoleInstancesContext from '../../../contexts/ConsoleInstancesContext'

const BILLING_PATH = '/account/billing'
const DISMISSED_UPSELL_KEY = 'plural-dismissed-upsell'
const GRADIENT_START = '#52F4D9'
const GRADIENT_END = '#494FF2'
const URGENT_COLORS = {
  dark: { fill: '#574500', border: '#855800' },
  light: { fill: '#FFFEF0', border: '#FFF59E' },
}

export enum ControlPlaneUpsellKind {
  Free = 'free',
  FreeTrialed = 'free-trialed',
  Trial = 'trial',
  TrialEnding = 'trial-ending',
  TrialEnded = 'trial-ended',
}

export type ControlPlaneUpsellScenario = {
  kind: Nullable<ControlPlaneUpsellKind>
  trialEndsAt: Nullable<Moment>
  hasCloudInstances?: boolean
}

export function useControlPlaneUpsellScenario(): ControlPlaneUpsellScenario {
  const {
    account,
    subscription,
    isPaidPlan,
    isTrialPlan,
    isTrialExpired,
    isTrialExpiringSoon,
    isTrialAvailable,
  } = useBillingSubscription()
  const { instances } = useContext(ConsoleInstancesContext)
  const hasCloudInstances = instances.length > 0
  const trialEndsAt = subscription?.trialUntil
    ? moment(subscription.trialUntil)
    : null

  if (isTrialPlan && !isTrialExpired)
    return {
      kind: isTrialExpiringSoon
        ? ControlPlaneUpsellKind.TrialEnding
        : ControlPlaneUpsellKind.Trial,
      trialEndsAt,
    }

  if (!account || isPaidPlan) return { kind: null, trialEndsAt: null }

  return {
    kind: isTrialExpired
      ? ControlPlaneUpsellKind.TrialEnded
      : isTrialAvailable
        ? ControlPlaneUpsellKind.Free
        : ControlPlaneUpsellKind.FreeTrialed,
    trialEndsAt,
    hasCloudInstances,
  }
}

const daysLeft = (trialEndsAt: Nullable<Moment>) =>
  Math.max(Math.ceil(trialEndsAt?.diff(moment(), 'days', true) ?? 0), 0)

const pluralizeDays = (days: number) => `${days} ${days === 1 ? 'day' : 'days'}`

function getUpsellCopy({
  kind,
  trialEndsAt,
  hasCloudInstances,
}: ControlPlaneUpsellScenario) {
  switch (kind) {
    case ControlPlaneUpsellKind.Free:
      return {
        message:
          'Try Pro free for 30 days: hosted instances, up to 10 clusters and a 99.9% SLA.',
        linkLabel: 'Start free trial',
        urgent: false,
      }
    case ControlPlaneUpsellKind.FreeTrialed:
      return {
        message: 'Let Plural host your control planes with Pro.',
        linkLabel: 'Upgrade to Pro',
        urgent: false,
      }
    case ControlPlaneUpsellKind.Trial:
      return {
        message: `${pluralizeDays(daysLeft(trialEndsAt))} left in your Pro trial.`,
        linkLabel: 'Upgrade to keep your Plural Cloud instances',
        urgent: false,
      }
    case ControlPlaneUpsellKind.TrialEnding:
      return {
        message: `Your Pro trial ends in ${pluralizeDays(daysLeft(trialEndsAt))}. On ${trialEndsAt?.format('MMM D')} your Plural Cloud instances and their data will be permanently deleted.`,
        linkLabel: 'Upgrade to keep them',
        urgent: true,
      }
    case ControlPlaneUpsellKind.TrialEnded:
      if (hasCloudInstances)
        return {
          message:
            'Your Pro trial ended and your Plural Cloud instances are scheduled for deletion. Self-hosted clusters are unaffected.',
          linkLabel: 'Upgrade to Pro to keep them',
          urgent: true,
        }

      return {
        message:
          'Your Pro trial ended and your Plural Cloud instances were deleted. Self-hosted clusters are unaffected.',
        linkLabel: 'Upgrade to Pro to create new instances',
        urgent: true,
      }
    default:
      return null
  }
}

export function ControlPlaneUpsell({
  scenario,
}: {
  scenario: ControlPlaneUpsellScenario
}) {
  const copy = getUpsellCopy(scenario)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_UPSELL_KEY) === scenario.kind
  )

  if (!copy || (!copy.urgent && dismissed)) return null

  const dismiss = () => {
    localStorage.setItem(DISMISSED_UPSELL_KEY, scenario.kind ?? '')
    setDismissed(true)
  }

  return (
    <BannerSC
      $urgent={copy.urgent}
      role={copy.urgent ? 'alert' : 'status'}
    >
      <div className="content">
        {copy.urgent && (
          <WarningIcon
            className="icon"
            size={16}
          />
        )}
        <p className="message">
          {copy.message}{' '}
          <Link
            className="link"
            to={BILLING_PATH}
          >
            {copy.linkLabel}
          </Link>
        </p>
      </div>
      {!copy.urgent && (
        <button
          type="button"
          className="dismiss"
          onClick={dismiss}
        >
          dismiss
        </button>
      )}
    </BannerSC>
  )
}

const BannerSC = styled.div<{ $urgent: boolean }>(({ theme, $urgent }) => {
  const light = theme.mode === 'light'
  const surface = light ? theme.colors['fill-zero'] : theme.colors['fill-two']
  const alpha = (color: string, pct: number) =>
    `color-mix(in srgb, ${color} ${pct}%, transparent)`

  return {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'center',
    gap: theme.spacing.xlarge,
    maxWidth: '100%',
    padding: `${theme.spacing.small} ${theme.spacing.medium}`,
    borderRadius: theme.borderRadiuses.large,
    ...($urgent
      ? {
          border: `1.5px solid ${URGENT_COLORS[theme.mode].border}`,
          backgroundColor: URGENT_COLORS[theme.mode].fill,
        }
      : {
          border: theme.borders[light ? 'fill-three' : 'fill-two'],
          background: `linear-gradient(90deg, ${alpha(GRADIENT_START, light ? 14 : 12)} 0%, ${alpha(GRADIENT_END, light ? 12 : 20)} 100%), ${surface}`,
        }),
    '.content': {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.small,
    },
    '.icon': {
      flexShrink: 0,
      color: theme.colors[light ? 'text-warning-light' : 'icon-warning'],
    },
    '.message': {
      ...theme.partials.text.body2,
      margin: 0,
      color: theme.colors.text,
    },
    '.link': {
      color: $urgent
        ? theme.colors['action-link-inline']
        : theme.colors['text-light'],
      fontWeight: $urgent ? 600 : undefined,
      textDecoration: 'underline',
      '&:hover': {
        color: $urgent ? theme.colors['action-link-inline'] : theme.colors.text,
      },
    },
    '.dismiss': {
      ...theme.partials.reset.button,
      ...theme.partials.text.caption,
      flexShrink: 0,
      padding: `2px ${theme.spacing.xsmall}`,
      borderRadius: theme.borderRadiuses.medium,
      border: theme.borders['fill-three'],
      backgroundColor: surface,
      color: theme.colors['icon-light'],
      cursor: 'pointer',
      '&:hover': { backgroundColor: theme.colors['fill-two-hover'] },
      '&:focus-visible': { outline: theme.borders['outline-focused'] },
    },
  }
})
