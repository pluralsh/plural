import {
  Callout,
  Chip,
  CloudIcon,
  ConsoleIcon,
  Flex,
} from '@pluralsh/design-system'
import { CloudOption } from 'components/shell/onboarding/sections/cloud/CloudOption'

import { useBillingSubscription } from 'components/account/billing/BillingSubscriptionProvider'

import { useCreateClusterContext } from '../CreateClusterWizard'

import { CalloutLinkButton } from './ChooseHostingOptionStep'

export function ChooseCloudStep() {
  const { cloudOption, setCloudOption } = useCreateClusterContext()
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
          selected={cloudOption === 'local'}
          onClick={() => setCloudOption('local')}
          icon={<CloudIcon size={40} />}
          chip={<Chip>Free Plan</Chip>}
          header="Deploy Yourself"
          description="Host your management plane in your own cloud."
        />
        <CloudOption
          selected={cloudOption === 'cloud'}
          onClick={() => setCloudOption('cloud')}
          icon={<ConsoleIcon size={40} />}
          chip={<Chip severity="info">Pro Plan</Chip>}
          header="Use Plural Cloud"
          description="Host your management plane in a Plural Cloud instance."
        />
      </Flex>
      {cloudOption === 'cloud' &&
        (isFreePlan || (isTrialPlan && isTrialExpired) ? (
          <Callout
            severity="warning"
            title="This option is only available on the Pro plan."
          >
            <Flex
              direction="column"
              gap="medium"
            >
              If you would like to create a shared cloud instance, please
              upgrade to a Pro or Enterprise plan - or contact sales to learn
              more.
              <Flex gap="medium">
                <CalloutLinkButton href="/account/billing">
                  Upgrade to Pro Plan
                </CalloutLinkButton>
                <CalloutLinkButton
                  secondary
                  newTab
                  href="https://www.plural.sh/contact"
                >
                  Contact sales
                </CalloutLinkButton>
              </Flex>
            </Flex>
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
