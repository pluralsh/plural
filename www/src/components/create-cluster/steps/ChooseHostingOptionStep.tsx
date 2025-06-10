import {
  Button,
  Callout,
  Chip,
  ConsoleIcon,
  Flex,
  GlobeIcon,
} from '@pluralsh/design-system'
import { CloudOption } from 'components/shell/onboarding/sections/cloud/CloudOption'

import { useBillingSubscription } from 'components/account/billing/BillingSubscriptionProvider'

import { ConsoleInstanceType } from 'generated/graphql'

import { ButtonProps } from '@pluralsh/design-system/dist/components/Button'

import { useCreateClusterContext } from '../CreateClusterWizard'
import { Link } from 'react-router-dom'

export function ChooseHostingOptionStep() {
  const { hostingOption, setHostingOption } = useCreateClusterContext()
  const { isEnterprisePlan } = useBillingSubscription()

  return (
    <Flex
      direction="column"
      gap="large"
    >
      <Flex gap="large">
        <CloudOption
          selected={hostingOption === ConsoleInstanceType.Shared}
          onClick={() => setHostingOption(ConsoleInstanceType.Shared)}
          hint="Ideal for smaller use cases"
          chip={<Chip severity="info">Pro Plan</Chip>}
          icon={<GlobeIcon size={40} />}
          header="Shared"
          description="Use a single cloud instance for every cluster."
        />
        <CloudOption
          selected={hostingOption === ConsoleInstanceType.Dedicated}
          onClick={() => setHostingOption(ConsoleInstanceType.Dedicated)}
          hint="Ideal for scale and security"
          chip={<Chip severity="warning">Enterprise Plan</Chip>}
          icon={<ConsoleIcon size={40} />}
          header="Dedicated"
          description="Dedicate a cloud instance for a single cluster."
        />
      </Flex>
      {hostingOption === ConsoleInstanceType.Dedicated && !isEnterprisePlan && (
        <Callout
          severity="warning"
          title="This option is only available on an Enterprise plan."
        >
          <Flex
            direction="column"
            gap="medium"
          >
            If you would like to create a dedicated cloud instance, please
            contact sales to inquire about upgrading to an Enterprise plan.
            <CalloutLinkButton
              newTab
              href="https://www.plural.sh/contact"
            >
              Contact sales
            </CalloutLinkButton>
          </Flex>
        </Callout>
      )}
    </Flex>
  )
}

export function CalloutLinkButton({
  href,
  newTab = false,
  ...props
}: ButtonProps & { href: string; newTab?: boolean }) {
  return (
    <Link
      to={href}
      {...(newTab && { target: '_blank', rel: 'noopener noreferrer' })}
      css={{ width: 'fit-content', textDecoration: 'none !important' }}
    >
      <Button {...props} />
    </Link>
  )
}
