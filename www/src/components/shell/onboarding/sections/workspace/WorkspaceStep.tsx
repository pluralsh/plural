import { Flex } from 'honorable'
import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Button, FormField, Input } from '@pluralsh/design-system'

import { OnboardingContext } from '../../context/onboarding'
import { useSetWorkspaceKeys } from '../../context/hooks'
import { CloudProvider, WorkspaceProps } from '../../context/types'
import { IsObjectEmpty } from '../../../../../utils/object'

type ValidationFieldKey = keyof WorkspaceProps
type Validation = {regex: RegExp, message: string}
type ValidationFn = (provider: CloudProvider) => {regex: RegExp, message: string}
type ValidationField = {[key in ValidationFieldKey]?: Validation | ValidationFn}

const VALIDATOR: ValidationField = {
  clusterName: (provider: CloudProvider) => ({
    regex: provider === CloudProvider.GCP ? /^[a-z][0-9-a-z]{0,11}$/ : /^[a-z][0-9\-a-z]{0,14}$/,
    message: `must be between 1 and ${provider === CloudProvider.GCP ? 12 : 15} characters and may contain hyphenated alphanumeric string only`,
  }),
  bucketPrefix: {
    regex: /^[a-z][a-z0-9-]{1,61}[a-z0-9]$/,
    message: 'must be between 3 and 64 characters and may contain hyphenated alphanumeric string only',
  },
}

function WorkspaceStep({ onBack, onNext }) {
  const { workspace, cloud } = useContext(OnboardingContext)
  const setWorkspaceKeys = useSetWorkspaceKeys()
  const [error, setError] = useState<{[key in ValidationFieldKey]?: string | null}>({})
  const isValid = useMemo(() => workspace?.clusterName && workspace?.bucketPrefix && workspace?.subdomain && IsObjectEmpty(error), [error, workspace?.bucketPrefix, workspace?.clusterName, workspace?.subdomain])

  useEffect(() => {
    Object.keys(workspace).forEach(key => {
      const validation = VALIDATOR[key as keyof WorkspaceProps]
      const { regex, message } = (typeof validation === 'function' ? validation(cloud.provider!) : validation) || {}
      const error = regex?.test(workspace?.[key]) ? null : message

      if (!regex || !message) return

      setError(err => ({ ...err, [key]: error }))
    })
  }, [cloud.provider, workspace])

  return (
    <Flex
      direction="column"
      gap="medium"
    >
      <FormField
        label="Cluster"
        hint={error.clusterName || 'Give your kubernetes cluster a unique name.'}
        error={!!error.clusterName}
        width="100%"
      >
        <Input
          value={workspace?.clusterName}
          error={!!error.clusterName}
          placeholder="plural-demo"
          onChange={({ target: { value } }) => setWorkspaceKeys({ clusterName: value })}
        />
      </FormField>

      <FormField
        label="Bucket prefix"
        error={!!error.bucketPrefix}
        hint={error.bucketPrefix || 'A unique prefix to generate bucket names.'}
        width="100%"
      >
        <Input
          value={workspace?.bucketPrefix}
          error={!!error.bucketPrefix}
          placeholder="plural"
          onChange={({ target: { value } }) => setWorkspaceKeys({ bucketPrefix: value })}
        />
      </FormField>

      <FormField
        label="Subdomain"
        hint="The domain you'll use for all your applications. Don't worry, you can change your domain later!"
        width="100%"
      >
        <Input
          value={workspace?.subdomain}
          placeholder="my-company"
          onChange={({ target: { value } }) => setWorkspaceKeys({ subdomain: value })}
          suffix=".onplural.sh"
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
        <Button
          onClick={onNext}
          disabled={!isValid}
        >Continue
        </Button>
      </Flex>
    </Flex>
  )
}

export default WorkspaceStep
