import { Div, Flex } from 'honorable'
import {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useApolloClient, useQuery } from '@apollo/client'
import {
  GraphQLToast,
  LoopingLogo,
  Wizard,
  WizardNavigation,
  WizardStepConfig,
  WizardStepper,
} from '@pluralsh/design-system'
import { ApolloError } from '@apollo/client/errors'

import { State, TerminalContext } from '../context/terminal'
import useOnboarded from '../../hooks/useOnboarded'

import { PosthogEvent, posthogCapture } from '../../../../utils/posthog'

import { APPLICATIONS_QUERY } from './queries'
import { buildSteps, install, toDefaultSteps } from './helpers'

const FILTERED_APPS = ['bootstrap', 'ingress-nginx', 'postgres']

function Installer() {
  const client = useApolloClient()
  const { mutation } = useOnboarded()
  const { shell: { provider }, configuration, setState } = useContext(TerminalContext)
  const onResetRef = useRef<{onReset: Dispatch<void>}>({ onReset: () => {} })
  const [stepsLoading, setStepsLoading] = useState(false)
  const [steps, setSteps] = useState<Array<WizardStepConfig>>([])
  const [error, setError] = useState<ApolloError | undefined>()
  const [defaultSteps, setDefaultSteps] = useState<Array<WizardStepConfig>>([])
  const [selectedApplications, setSelectedApplications] = useState<Array<string>>([])

  const { data: { repositories: { edges: applicationNodes } = { edges: undefined } } = {}, refetch } = useQuery(APPLICATIONS_QUERY, {
    variables: { provider },
    skip: !provider,
    fetchPolicy: 'network-only',
  })

  const applications = useMemo(() => applicationNodes?.map(({ node }) => node).filter(app => ((!app?.private ?? true) && !app?.installation) && !FILTERED_APPS.includes(app?.name)), [applicationNodes])

  const onInstall = useCallback((payload: Array<WizardStepConfig>) => {
    setStepsLoading(true)

    install(client, payload, provider)
      .then(() => {
        onResetRef?.current?.onReset()
        setState(State.Installed)
        mutation()
        refetch()
      })
      .catch(err => setError(err))
      .finally(() => setStepsLoading(false))
  }, [client, mutation, provider, refetch, setState])

  const onSelect = useCallback((selectedApplications: Array<WizardStepConfig>) => {
    const build = async () => {
      const steps = await buildSteps(client, provider, selectedApplications)

      setSteps(steps)
    }

    setSelectedApplications(selectedApplications.map(app => app.label ?? 'unknown'))
    setStepsLoading(true)
    build().finally(() => setStepsLoading(false))
  }, [client, provider])

  useEffect(() => setDefaultSteps(toDefaultSteps(applications, provider)), [applications, provider])

  // Capture errors and send to posthog
  useEffect(() => error && posthogCapture(PosthogEvent.Installer, { error, applications: selectedApplications, provider }), [error, selectedApplications, provider])

  if (!applications || defaultSteps.length === 0) {
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
      padding="medium"
      borderRight="1px solid border"
    >
      <Div
        height="100%"
        style={{ position: 'absolute' }}
      />
      <Div
        width={600}
        height="100%"
        transition="width 300ms linear, opacity 150ms linear"
      >
        <Wizard
          onSelect={onSelect}
          defaultSteps={defaultSteps}
          dependencySteps={steps}
          limit={5}
          loading={stepsLoading || !configuration}
          onResetRef={onResetRef}
        >
          {{
            stepper: <WizardStepper />,
            navigation: <WizardNavigation onInstall={onInstall} />,
          }}
        </Wizard>
      </Div>

      {error && (
        <GraphQLToast
          error={{ graphQLErrors: [...error.graphQLErrors] }}
          header="Error"
          onClose={() => setError(undefined)}
          margin="medium"
          marginHorizontal="xxxxlarge"
          closeTimeout={20000}
        />
      )}
    </Div>
  )
}

export default Installer
