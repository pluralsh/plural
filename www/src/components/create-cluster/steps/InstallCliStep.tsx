import { Callout, Flex } from '@pluralsh/design-system'
import { CliInstallationBaseInfo } from 'components/shell/onboarding/sections/cli/CLIInstallationStep'

import { useCreateClusterContext } from '../CreateClusterWizard'

export function InstallCliStep() {
  const { cloudOption } = useCreateClusterContext()

  return (
    <Flex
      direction="column"
      gap="xlarge"
    >
      {cloudOption === 'cloud' && (
        <Callout title="The next two steps are in your local terminal">
          This will help to setup and properly configure the management plane and
          Plural Cloud instance with your local environment.
        </Callout>
      )}
      <CliInstallationBaseInfo />
    </Flex>
  )
}
