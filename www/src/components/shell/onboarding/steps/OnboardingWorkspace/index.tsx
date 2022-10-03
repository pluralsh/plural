import { Link } from 'react-router-dom'
import { Button, FormField, Input } from 'pluralsh-design-system'

import { usePersistedWorkspace } from '../../../usePersistance'

import { SECTION_WORKSPACE } from '../../../constants'

import Exceptions from '../../Exceptions'
import OnboardingCard from '../../OnboardingCard'
import OnboardingNavSection from '../../OnboardingNavSection'

import useOnboardingNavigation from '../../useOnboardingNavigation'
import useValidation from '../../useValidation'

function OnboardingWorkspace() {
  const [workspace, setWorkspace] = usePersistedWorkspace()
  const { previousTo, nextTo } = useOnboardingNavigation(SECTION_WORKSPACE)
  const { error, exceptions } = useValidation(SECTION_WORKSPACE)

  return (
    <>
      <OnboardingCard title="Configure Plural Workspace">
        <FormField
          width="100%"
          marginTop="large"
          caption="Give your kubernetes cluster a unique name."
          label="Cluster"
        >
          <Input
            width="100%"
            value={workspace.cluster}
            onChange={({ target: { value } }) => setWorkspace(x => ({ ...x, cluster: value }))}
            placeholder="plural-demo-cluster"
          />
        </FormField>
        <FormField
          width="100%"
          marginTop="large"
          caption="A unique prefix to generate bucket names."
          label="Bucket prefix"
        >
          <Input
            width="100%"
            value={workspace.bucketPrefix}
            onChange={({ target: { value } }) => setWorkspace(x => ({ ...x, bucketPrefix: value }))}
            placeholder="plural"
          />
        </FormField>
        <FormField
          width="100%"
          marginTop="large"
          caption="The domain you'll use for all your applications."
          label="Subdomain"
        >
          <Input
            width="100%"
            value={workspace.subdomain}
            onChange={({ target: { value } }) => setWorkspace(x => ({ ...x, subdomain: value }))}
            placeholder="my-company"
            suffix={<>.onplural.sh</>}
          />
        </FormField>
        {exceptions && <Exceptions exceptions={exceptions} />}
      </OnboardingCard>
      <OnboardingNavSection>
        <Button
          secondary
          as={Link}
          to={previousTo}
        >
          Back
        </Button>
        <Button
          primary
          disabled={error}
          as={Link}
          to={nextTo}
        >
          Continue
        </Button>
      </OnboardingNavSection>
    </>
  )
}

export default OnboardingWorkspace
