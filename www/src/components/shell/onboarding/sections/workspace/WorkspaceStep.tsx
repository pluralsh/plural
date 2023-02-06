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
import { WorkspaceProps } from '../../context/types'
import { IsObjectEmpty } from '../../../../../utils/object'

type ValidationFieldKey = keyof WorkspaceProps
type Validation = {regex: RegExp, message: string}
type ValidationField = {[key in ValidationFieldKey]?: Validation}

const VALIDATOR: ValidationField = {
  clusterName: {
    regex: /^[a-z][0-9\-a-z]{0,12}$/,
    message: 'must be between 1 and 12 characters and may contain alphanumeric characters only',
  },
}

function WorkspaceStep({ onBack, onNext }) {
  const { workspace } = useContext(OnboardingContext)
  const setWorkspaceKeys = useSetWorkspaceKeys()
  const [error, setError] = useState<{[key in ValidationFieldKey]?: string | null}>({})
  const isValid = useMemo(() => workspace?.clusterName && workspace?.bucketPrefix && workspace?.subdomain && IsObjectEmpty(error), [error, workspace?.bucketPrefix, workspace?.clusterName, workspace?.subdomain])

  useEffect(() => {
    Object.keys(workspace).forEach(key => {
      const { regex, message } = VALIDATOR[key as keyof WorkspaceProps] || {}
      const error = regex?.test(workspace?.[key]) ? null : message

      if (!regex || !message) return

      setError(err => ({ ...err, [key]: error }))
    })
  }, [workspace])

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
