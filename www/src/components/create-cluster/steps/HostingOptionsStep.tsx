import { Callout, CloudIcon, ConsoleIcon, Flex } from '@pluralsh/design-system'
import { CloudOption } from 'components/shell/onboarding/sections/cloud/CloudOption'

import { useBillingSubscription } from 'components/account/billing/BillingSubscriptionProvider'

import { useTheme } from 'styled-components'

import { useCreateClusterContext } from '../CreateClusterWizard'

export function HostingOptionsStep() {
  const theme = useTheme()
  const { hostingOption, setHostingOption } = useCreateClusterContext()
  const { isPaidPlan, isTrialPlan, daysUntilTrialExpires, isTrialExpired } =
    useBillingSubscription()
  const isFreePlan = !isPaidPlan && !isTrialPlan

  return (
    <Flex
      direction="column"
      gap="large"
    >
      <Flex gap="large">
        <CloudOption
          selected={hostingOption === 'local'}
          onClick={() => setHostingOption('local')}
          icon={
            <CloudIcon
              size={40}
              color={theme.colors['icon-light']}
            />
          }
          header="Deploy Yourself"
          description="Host your control plane in your own cloud."
        />
        <CloudOption
          selected={hostingOption === 'cloud'}
          onClick={() => setHostingOption('cloud')}
          icon={
            <ConsoleIcon
              size={40}
              color={theme.colors['icon-light']}
            />
          }
          header="Use Plural Cloud"
          description="Host your control plane in a Plural Cloud instance."
        />
      </Flex>
      {hostingOption === 'cloud' &&
        (isFreePlan || (isTrialPlan && isTrialExpired) ? (
          <Callout
            severity="warning"
            title="This option is not available on a free plan."
          >
            To use a Plural Cloud Instance for your cluster deployment, consider{' '}
            <a
              href="/account/billing"
              target="_blank"
              rel="noopener noreferrer"
            >
              upgrading your plan.
            </a>
          </Callout>
        ) : isTrialPlan ? (
          <Callout
            title={`You will have access to this cloud instance for ${daysUntilTrialExpires} days.`}
          >
            Once your free trial ends, you can keep on using your Plural Cloud
            instance by{' '}
            <a
              href="/account/billing"
              target="_blank"
              rel="noopener noreferrer"
            >
              upgrading your plan.
            </a>
          </Callout>
        ) : null)}
    </Flex>
  )
}
