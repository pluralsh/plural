import { useApolloClient, useQuery } from '@apollo/client'
import { ApolloError } from '@apollo/client/errors'
import {
  GraphQLToast,
  Wizard,
  WizardNavigation,
  WizardStepConfig,
  WizardStepper,
} from '@pluralsh/design-system'
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
import { useSearchParams } from 'react-router-dom'

import LoadingIndicator from '../../../../utils/LoadingIndicator'
import { ImpersonationContext } from '../../../context/impersonation'
import useOnboarded from '../../../hooks/useOnboarded'
import { State, TerminalContext } from '../../context/terminal'
import { useSelectCluster } from '../Sidebar'

import { InstallerContext } from './context'
import { buildSteps, install, toDefaultSteps } from './helpers'
import { APPLICATIONS_QUERY } from './queries'

const FILTERED_APPS = ['bootstrap', 'ingress-nginx', 'postgres', 'monitoring']
const FORCED_APPS = {
  console:
    'The Plural Console will allow you to monitor, upgrade, and deploy applications easily from one centralized place.',
}

function Installer({ onInstallSuccess }) {
  const client = useApolloClient()
  const { mutation } = useOnboarded()
  const { shell, configuration, setState } = useContext(TerminalContext)
  const {
    user: { demoing },
  } = useContext(ImpersonationContext)
  const { provider } = shell
  const onResetRef = useRef<{ onReset: Dispatch<void> }>({ onReset: () => {} })
  const [searchParams] = useSearchParams()
  const { clusters } = useSelectCluster(shell)

  const [stepsLoading, setStepsLoading] = useState(false)
  const [steps, setSteps] = useState<Array<WizardStepConfig>>([])
  const [error, setError] = useState<ApolloError | undefined>()
  const [defaultSteps, setDefaultSteps] = useState<Array<WizardStepConfig>>([])
  const [domains, setDomains] = useState<Record<string, string>>({})

  const {
    data: {
      repositories: { edges: applicationNodes } = { edges: undefined },
    } = {},
    refetch,
  } = useQuery(APPLICATIONS_QUERY, {
    variables: { provider, installed: false },
    skip: !provider,
    fetchPolicy: 'network-only',
  })

  const {
    data: {
      repositories: { edges: installedApplications } = { edges: undefined },
    } = {},
    refetch: refetchInstalledApps,
  } = useQuery(APPLICATIONS_QUERY, {
    variables: { provider, installed: true },
    skip: !provider,
    fetchPolicy: 'network-only',
  })

  const context = useMemo(() => ({ domains, setDomains }), [domains])
  const applications = useMemo(
    () =>
      applicationNodes
        ?.map(({ node }) => node)
        .filter((app) => !FILTERED_APPS.includes(app?.name)),
    [applicationNodes]
  )
  const limit = useMemo(() => (demoing ? 3 : 5), [demoing])
  const preselectedApps = useMemo(() => {
    const names = searchParams.get('install')

    if (!names) return undefined

    return Object.fromEntries(
      names
        .split(',')
        .map((name) => [name, 'Application preselected based on user action.'])
    )
  }, [searchParams])

  const onInstall = useCallback(
    (payload: Array<WizardStepConfig>) => {
      setStepsLoading(true)

      install(client, payload, provider)
        .then(() => {
          onResetRef?.current?.onReset()
          setState(State.Installed)
          mutation()
          refetch()
          refetchInstalledApps()
          onInstallSuccess()
        })
        .catch((err) => setError(err))
        .finally(() => setStepsLoading(false))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client, mutation, provider, refetch, refetchInstalledApps, setState]
  )

  const onSelect = useCallback(
    (selectedApplications: Array<WizardStepConfig>) => {
      const build = async () => {
        const steps = await buildSteps(
          client,
          provider,
          selectedApplications,
          new Set<string>(
            installedApplications?.map((repository) => repository.node.name)
          )
        )

        setSteps(steps)
      }

      setStepsLoading(true)
      build().finally(() => setStepsLoading(false))
    },
    [client, installedApplications, provider]
  )

  useEffect(
    () =>
      setDefaultSteps(
        toDefaultSteps(applications, provider, {
          ...preselectedApps,
          ...FORCED_APPS,
        })
      ),
    [applications, preselectedApps, provider]
  )

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
    <InstallerContext.Provider value={context}>
      <Div
        height={
          clusters?.length > 1 ? 'calc(100% - 96px)' : 'calc(100% - 56px)'
        }
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
              navigation: (
                <WizardNavigation
                  onInstall={onInstall}
                  tooltip={
                    demoing ? 'Max 3 applications on GCP demo' : undefined
                  }
                />
              ),
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
    </InstallerContext.Provider>
  )
}

export default Installer
