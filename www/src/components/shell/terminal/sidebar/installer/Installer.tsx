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
  Wizard,
  WizardNavigation,
  WizardStepConfig,
  WizardStepper,
} from '@pluralsh/design-system'
import { ApolloError } from '@apollo/client/errors'
import { useSearchParams } from 'react-router-dom'

import useOnboarded from '../../../hooks/useOnboarded'
import { State, TerminalContext } from '../../context/terminal'
import CurrentUserContext from '../../../../../contexts/CurrentUserContext'
import { PosthogEvent, posthogCapture } from '../../../../../utils/posthog'

import LoadingIndicator from '../../../../utils/LoadingIndicator'

import { buildSteps, install, toDefaultSteps } from './helpers'
import { APPLICATIONS_QUERY } from './queries'

const FILTERED_APPS = ['bootstrap', 'ingress-nginx', 'postgres']
const FORCED_APPS = {
  console: 'The Plural Console will allow you to monitor, upgrade, and deploy applications easily from one centralized place.',
}

function Installer({ onInstallSuccess }) {
  const client = useApolloClient()
  const { mutation } = useOnboarded()
  const { shell: { provider }, configuration, setState } = useContext(TerminalContext)
  const me = useContext(CurrentUserContext)
  const onResetRef = useRef<{onReset: Dispatch<void>}>({ onReset: () => {} })
  const [searchParams] = useSearchParams()

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
  const limit = useMemo(() => (me?.demoing ? 3 : 5), [me?.demoing])
  const preselectedApps = useMemo(() => {
    const names = searchParams.get('install')

    if (!names) return undefined

    return Object.fromEntries(names.split(',').map(name => [name, 'Application preselected based on user action.']))
  }, [searchParams])

  const onInstall = useCallback((payload: Array<WizardStepConfig>) => {
    setStepsLoading(true)

    install(client, payload, provider)
      .then(() => {
        onResetRef?.current?.onReset()
        setState(State.Installed)
        mutation()
        refetch()
        posthogCapture(PosthogEvent.Installer, {
          provider,
          applications: selectedApplications,
        })
        onInstallSuccess()
      })
      .catch(err => setError(err))
      .finally(() => setStepsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => setDefaultSteps(toDefaultSteps(applications, provider, {
    ...preselectedApps,
    ...FORCED_APPS,
  })),
  [applications, preselectedApps, provider])

  // Capture errors and send to posthog
  useEffect(() => error && posthogCapture(PosthogEvent.Installer, { error, applications: selectedApplications, provider }), [error, selectedApplications, provider])

  if (!applications || defaultSteps.length === 0) {
    return (
      <Flex
        width={600}
        height="100%"
      >
        <LoadingIndicator />
      </Flex>
    )
  }

  return (
    <Div
      height="calc(100% - 56px)"
      paddingTop="large"
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
          limit={limit}
          loading={stepsLoading || !configuration}
          onResetRef={onResetRef}
        >
          {{
            stepper: <WizardStepper />,
            navigation: <WizardNavigation
              onInstall={onInstall}
              tooltip={me?.demoing ? 'Max 3 applications on GCP demo' : undefined}
            />,
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
