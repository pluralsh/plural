import { CloudIcon, Flex } from '@pluralsh/design-system'
import { CloudOption } from 'components/shell/onboarding/sections/cloud/CloudOption'

import { useTheme } from 'styled-components'

import { useCreateClusterContext } from '../CreateClusterWizard'

export function HostingOptionsStep() {
  const theme = useTheme()
  const { hostingOption, setHostingOption } = useCreateClusterContext()

  return (
    <Flex gap="large">
      <CloudOption
        selected={hostingOption === 'local'}
        onClick={() => setHostingOption('local')}
        icon={
          <CloudIcon
            size={40}
            color={theme.colors['text-light']}
          />
        }
        header="Deploy Yourself"
        description="Host your control plane in your own cloud."
      />
      <CloudOption
        selected={hostingOption === 'cloud'}
        onClick={() => setHostingOption('cloud')}
        icon={
          <CloudIcon
            size={40}
            color={theme.colors['text-light']}
          />
        }
        header="Use Plural Cloud"
        description="Host your control plane in a Plural Cloud instance."
      />
    </Flex>
  )
}
