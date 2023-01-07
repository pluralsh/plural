import { Button, FormField, Input } from '@pluralsh/design-system'
import { Flex } from 'honorable'
import { useContext } from 'react'

import { OnboardingContext } from '../../context/onboarding'
import { useSetWorkspaceKeys } from '../../context/hooks'

function WorkspaceStep({ onBack, onNext }) {
  const { workspace } = useContext(OnboardingContext)
  const setWorkspaceKeys = useSetWorkspaceKeys()

  return (
    <Flex
      direction="column"
      gap="medium"
    >
      <FormField
        label="Cluster"
        hint="Give your kubernetes cluster a unique name."
        width="100%"
      >
        <Input
          value={workspace?.clusterName}
          placeholder="plural-demo-cluster"
          onChange={({ target: { value } }) => setWorkspaceKeys({ clusterName: value })}
        />
      </FormField>

      <FormField
        label="Bucket prefix"
        hint="A unique prefix to generate bucket names."
        width="100%"
      >
        <Input
          value={workspace?.bucketPrefix}
          placeholder="plural"
          onChange={({ target: { value } }) => setWorkspaceKeys({ bucketPrefix: value })}
        />
      </FormField>

      <FormField
        label="Subdomain"
        hint="The domain you'll use for all your applications."
        width="100%"
      >
        <Input
          value={workspace?.subdomain}
          placeholder="my-company"
          onChange={({ target: { value } }) => setWorkspaceKeys({ subdomain: value })}
          suffix="onplural.sh"
        />
      </FormField>

      <Flex
        gap="medium"
        justify="space-between"
        borderTop="1px solid border"
        marginTop="xlarge"
        paddingTop="large"
      >
        <Button
          secondary
          onClick={onBack}
        >Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </Flex>
    </Flex>
  )
}

export default WorkspaceStep
