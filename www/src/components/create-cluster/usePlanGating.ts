import { useBillingSubscription } from 'components/account/billing/BillingSubscriptionProvider'

export type PlanBlockedReason =
  'delinquent' | 'legacy' | 'trial-ended' | 'no-plan'

export const PLAN_BLOCKED_COPY: Record<
  PlanBlockedReason,
  { title: string; body: string }
> = {
  delinquent: {
    title: 'Your last payment failed',
    body: 'Update your payment method to use Plural Cloud, or self-host Console for free with the Plural CLI.',
  },
  legacy: {
    title: 'Legacy plans don’t include Plural Cloud',
    body: 'Upgrade to Pro to create a hosted instance, or self-host Console for free with the Plural CLI.',
  },
  'trial-ended': {
    title: 'Your trial has ended',
    body: 'Add a payment method to start your Pro plan, or self-host Console for free with the Plural CLI.',
  },
  'no-plan': {
    title: 'Plural Cloud needs a Pro plan or an active trial',
    body: 'Add a payment method to start your Pro plan, or self-host Console for free with the Plural CLI.',
  },
}

export function usePlanGating() {
  const {
    account,
    subscription,
    isPaidPlan,
    isEnterprisePlan,
    isLegacyUser,
    isTrialPlan,
    isTrialExpired,
    isDelinquent,
  } = useBillingSubscription()

  const delinquent = !!account?.delinquentAt && isDelinquent
  const canCreateShared =
    !delinquent && (isPaidPlan || (isTrialPlan && !isTrialExpired))
  const canCreateDedicated =
    canCreateShared && (isEnterprisePlan || !!subscription?.plan?.enterprise)

  const blockedReason: PlanBlockedReason | null = canCreateShared
    ? null
    : delinquent
      ? 'delinquent'
      : isLegacyUser && !isPaidPlan
        ? 'legacy'
        : isTrialPlan && isTrialExpired
          ? 'trial-ended'
          : 'no-plan'

  return {
    canCreateShared,
    canCreateDedicated,
    isEnterprise: isEnterprisePlan,
    blockedReason,
  }
}
