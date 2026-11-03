import { Button, Flex, Input } from '@pluralsh/design-system'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { GqlError } from 'components/utils/Alert'
import { PLURAL_CLOUD_INSTANCES_PATH_ABS } from 'components/overview/clusters/plural-cloud/PluralCloudInstances'
import { useCurrentUser } from 'contexts/CurrentUserContext'
import {
  ConsoleInstanceStatus,
  useUpdateAccountMutation,
  useUpdateUserMutation,
} from 'generated/graphql'

import { BuildTimeline } from '../BuildTimeline'
import { CreateClusterActions } from '../CreateClusterActions'
import { useCreateClusterContext } from '../CreateClusterWizard'
import { InstanceHeader, InstanceSummary } from '../InstanceSummary'
import { PixelPigeon } from '../PixelPigeon'
import { BodyTextSC, FormFieldSC, OverlineSC } from '../shared'

const BUILD_STAGES = [
  {
    title: 'Create management cluster',
    description:
      'Provision the database and Kubernetes resources that host your console.',
  },
  {
    title: 'Install Plural Console',
    description:
      'Deploy Console with logging, Prometheus, and AI preconfigured.',
  },
  {
    title: 'Configure DNS and sign-in',
    description: 'Set up your console URL and connect your Plural login.',
  },
]

const COMPLETED_STAGES: Partial<Record<ConsoleInstanceStatus, number>> = {
  [ConsoleInstanceStatus.Pending]: 0,
  [ConsoleInstanceStatus.DatabaseCreated]: 1,
  [ConsoleInstanceStatus.StackCreated]: 1,
  [ConsoleInstanceStatus.DeploymentCreated]: 2,
  [ConsoleInstanceStatus.Provisioned]: 3,
}

export function BuildStep() {
  const navigate = useNavigate()
  const { consoleInstance, startOver } = useCreateClusterContext()
  const completed = consoleInstance
    ? (COMPLETED_STAGES[consoleInstance.status] ?? 0)
    : 0

  return (
    <>
      <InstanceHeader
        name={consoleInstance?.name ?? 'your instance'}
        running={false}
      />
      <InstanceSummary instance={consoleInstance} />
      <BuildTimeline
        items={BUILD_STAGES.map((stage, i) => ({
          ...stage,
          done: i < completed,
        }))}
      />
      <PixelPigeon />
      <YourDetails />
      <CreateClusterActions>
        <Button
          secondary
          onClick={startOver}
        >
          Create another instance
        </Button>
        <Button
          secondary
          onClick={() => navigate(PLURAL_CLOUD_INSTANCES_PATH_ABS)}
        >
          Back to Instances
        </Button>
      </CreateClusterActions>
    </>
  )
}

function YourDetails() {
  const me = useCurrentUser()
  const [company, setCompany] = useState(me.account?.name ?? '')
  const [username, setUsername] = useState(me.name ?? '')
  const [saved, setSaved] = useState(false)
  const [updateAccount, accountResult] = useUpdateAccountMutation()
  const [updateUser, userResult] = useUpdateUserMutation()

  const companyChanged = !!company.trim() && company !== me.account?.name
  const usernameChanged = !!username.trim() && username !== me.name
  const error = accountResult.error || userResult.error

  const save = async () => {
    try {
      await Promise.all([
        companyChanged &&
          updateAccount({
            variables: { attributes: { name: company.trim() } },
          }),
        usernameChanged &&
          updateUser({ variables: { attributes: { name: username.trim() } } }),
      ])
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }

  return (
    <Flex
      direction="column"
      gap="medium"
      paddingTop="medium"
    >
      <Flex
        direction="column"
        gap="xsmall"
      >
        <OverlineSC>Your details (optional)</OverlineSC>
        <BodyTextSC>
          Teammates see these when you invite them. Change them later in
          settings.
        </BodyTextSC>
      </Flex>
      {error && <GqlError error={error} />}
      <FormFieldSC label="Company">
        <Input
          placeholder="Acme Inc."
          value={company}
          onChange={(e) => {
            setCompany(e.target.value)
            setSaved(false)
          }}
        />
      </FormFieldSC>
      <FormFieldSC label="Username">
        <Input
          placeholder="you"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setSaved(false)
          }}
        />
      </FormFieldSC>
      <Flex justify="flex-end">
        <Button
          secondary
          small
          disabled={!companyChanged && !usernameChanged}
          loading={accountResult.loading || userResult.loading}
          onClick={save}
        >
          {saved && !companyChanged && !usernameChanged
            ? 'Saved'
            : 'Save details'}
        </Button>
      </Flex>
    </Flex>
  )
}
