import { Div, Flex } from 'honorable'
import { useEffect, useState } from 'react'
import {
  LoopingLogo,
  Wizard,
  WizardNavigation,
  WizardStepConfig,
  WizardStepper,
} from '@pluralsh/design-system'
import { useApolloClient, useQuery } from '@apollo/client'

import { Provider } from '../../../../../generated/graphql'

import { APPLICATIONS_QUERY } from './queries'
import { buildSteps, toDefaultSteps } from './helpers'

const FILTERED_RECIPES = ['bootstrap']

function Installer({ provider }: {provider: Provider}) {
  const client = useApolloClient()

  const [selectedApplications, setSelectedApplications] = useState<Array<WizardStepConfig>>([])
  const [stepsLoading, setStepsLoading] = useState(false)
  const [steps, setSteps] = useState<Array<WizardStepConfig>>([])

  const { data: { repositories: { edges: applicationNodes } = { edges: undefined } } = {} } = useQuery(APPLICATIONS_QUERY, { variables: { provider } })
  const applications = applicationNodes?.map(({ node }) => node).filter(app => (!app?.private ?? true) && !FILTERED_RECIPES.includes(app?.name))

  useEffect(() => {
    const build = async () => {
      const steps = await buildSteps(client, provider, selectedApplications)

      setSteps(steps)
    }

    setStepsLoading(true)
    build().then(() => setStepsLoading(false))
  }, [client, selectedApplications.length, provider])

  if (!applications) {
    return (
      <Flex
        flexGrow={0}
        width={600}
        align="center"
        justify="center"
        borderRight="1px solid border"
        padding="medium"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  return (
    <Div
      width={600}
      borderRight="1px solid border"
      padding="medium"
    >
      <Wizard
        onSelect={apps => setSelectedApplications(apps)}
        defaultSteps={toDefaultSteps(applications, provider)}
        dependencySteps={steps}
        limit={5}
        loading={stepsLoading}
      >
        {{
          stepper: <WizardStepper />,
          navigation: <WizardNavigation onInstall={() => {}} />,
        }}
      </Wizard>
    </Div>
  )
}

export default Installer
