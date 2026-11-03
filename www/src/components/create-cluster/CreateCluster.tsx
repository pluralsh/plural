import { useSetBreadcrumbs } from '@pluralsh/design-system'
import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { PLURAL_CLOUD_INSTANCES_PATH_ABS } from 'components/overview/clusters/plural-cloud/PluralCloudInstances'
import { GqlError } from 'components/utils/Alert'
import {
  ConsoleInstanceStatus,
  useConsoleInstanceQuery,
} from 'generated/graphql'
import usePersistedState from 'hooks/usePersistedState'

import {
  CLOUD_OPTION_KEY,
  CREATE_CLUSTER_TTL_KEY,
  CUR_CONSOLE_INSTANCE_KEY,
  CUR_CREATE_CLUSTER_STEP_KEY,
  HOSTING_OPTION_KEY,
  SETUP_GUIDE_OPEN_KEY,
} from './constants'
import {
  FINISHED_CONSOLE_INSTANCE_KEY,
  FINISHED_LOCAL_CREATE_KEY,
} from './CreateClusterActions'
import {
  CloudOption,
  CREATE_CLUSTER_STEPS,
  CreateClusterContext,
  CreateClusterContextType,
  CreateClusterStepKey,
  isCreateClusterStepKey,
} from './CreateClusterWizard'
import { SetupFlowLayout, SetupStepStatus } from './SetupFlowLayout'
import { BuildStep } from './steps/BuildStep'
import { InstanceStep } from './steps/InstanceStep'
import { OpenConsoleStep } from './steps/OpenConsoleStep'

export {
  CLOUD_OPTION_KEY,
  CUR_CONSOLE_INSTANCE_KEY,
  CUR_CREATE_CLUSTER_STEP_KEY,
  HOSTING_OPTION_KEY,
} from './constants'

const TTL = { key: CREATE_CLUSTER_TTL_KEY }

const STEP_COMPONENTS = {
  [CreateClusterStepKey.Instance]: InstanceStep,
  [CreateClusterStepKey.Build]: BuildStep,
  [CreateClusterStepKey.OpenConsole]: OpenConsoleStep,
}

export function CreateCluster() {
  const navigate = useNavigate()
  const [persistedStep, setCurStep] = usePersistedState<CreateClusterStepKey>(
    CUR_CREATE_CLUSTER_STEP_KEY,
    CreateClusterStepKey.Instance,
    TTL
  )
  const [persistedCloudOption, setCloudOption] = usePersistedState<CloudOption>(
    CLOUD_OPTION_KEY,
    'cloud',
    TTL
  )
  const [consoleInstanceId, setConsoleInstanceId] = usePersistedState<
    Nullable<string>
  >(CUR_CONSOLE_INSTANCE_KEY, null, TTL)
  const [guideOpen, setGuideOpen] = usePersistedState(
    SETUP_GUIDE_OPEN_KEY,
    false
  )

  const curStep = isCreateClusterStepKey(persistedStep)
    ? persistedStep
    : CreateClusterStepKey.Instance
  const cloudOption: CloudOption =
    persistedCloudOption === 'local' ? 'local' : 'cloud'

  const { data, error } = useConsoleInstanceQuery({
    variables: { id: consoleInstanceId ?? '' },
    skip: !consoleInstanceId,
    fetchPolicy: 'cache-and-network',
    pollInterval: 10_000,
  })
  const consoleInstance = data?.consoleInstance
  const isProvisioned =
    consoleInstance?.status === ConsoleInstanceStatus.Provisioned

  useEffect(() => {
    if (consoleInstanceId && curStep === CreateClusterStepKey.Instance)
      setCurStep(CreateClusterStepKey.Build)
    else if (isProvisioned && curStep === CreateClusterStepKey.Build)
      setCurStep(CreateClusterStepKey.OpenConsole)
  }, [consoleInstanceId, isProvisioned, curStep, setCurStep])

  const cancel = useCallback(() => {
    clearCreateClusterCache()
    navigate(PLURAL_CLOUD_INSTANCES_PATH_ABS)
  }, [navigate])

  const startOver = useCallback(() => {
    setConsoleInstanceId(null)
    setCurStep(CreateClusterStepKey.Instance)
  }, [setConsoleInstanceId, setCurStep])

  const finish = useCallback(() => {
    if (consoleInstanceId)
      localStorage.setItem(FINISHED_CONSOLE_INSTANCE_KEY, consoleInstanceId)
    if (cloudOption === 'local')
      localStorage.setItem(FINISHED_LOCAL_CREATE_KEY, 'true')
    clearCreateClusterCache()
    navigate(
      cloudOption === 'local'
        ? '/overview/clusters/self-hosted'
        : PLURAL_CLOUD_INSTANCES_PATH_ABS
    )
  }, [cloudOption, consoleInstanceId, navigate])

  const context: CreateClusterContextType = useMemo(
    () => ({
      curStep,
      setCurStep,
      cloudOption,
      setCloudOption,
      consoleInstanceId,
      setConsoleInstanceId,
      consoleInstance,
      isProvisioned,
      cancel,
      finish,
      startOver,
    }),
    [
      curStep,
      setCurStep,
      cloudOption,
      setCloudOption,
      consoleInstanceId,
      setConsoleInstanceId,
      consoleInstance,
      isProvisioned,
      cancel,
      finish,
      startOver,
    ]
  )

  const instanceName = consoleInstance?.name
  const showInstanceCrumb =
    !!instanceName && curStep !== CreateClusterStepKey.Instance

  useSetBreadcrumbs(
    useMemo(
      () => [
        { label: 'plural cloud', url: '/' },
        { label: 'instances', url: PLURAL_CLOUD_INSTANCES_PATH_ABS },
        showInstanceCrumb
          ? { label: instanceName, url: '' }
          : { label: 'create', url: '' },
      ],
      [instanceName, showInstanceCrumb]
    )
  )

  const statuses: Record<CreateClusterStepKey, SetupStepStatus> = {
    [CreateClusterStepKey.Instance]: consoleInstanceId ? 'complete' : 'pending',
    [CreateClusterStepKey.Build]: isProvisioned
      ? 'complete'
      : consoleInstanceId
        ? 'in-progress'
        : 'pending',
    [CreateClusterStepKey.OpenConsole]: 'pending',
  }
  const reachable: Record<CreateClusterStepKey, boolean> = {
    [CreateClusterStepKey.Instance]: !consoleInstanceId,
    [CreateClusterStepKey.Build]: !!consoleInstanceId,
    [CreateClusterStepKey.OpenConsole]: isProvisioned,
  }
  const { title, subtitle } = getStepHeader(curStep, instanceName)
  const StepComponent = STEP_COMPONENTS[curStep]

  return (
    <CreateClusterContext.Provider value={context}>
      <SetupFlowLayout
        title={title}
        subtitle={subtitle}
        navLabel="Create instance steps"
        steps={CREATE_CLUSTER_STEPS.map(({ key, label }) => ({
          key,
          label,
          status: statuses[key],
          reachable: reachable[key],
        }))}
        curStep={curStep}
        onStepChange={setCurStep}
        guideOpen={guideOpen}
        setGuideOpen={setGuideOpen}
        banner={error && <GqlError error={error} />}
      >
        <StepComponent />
      </SetupFlowLayout>
    </CreateClusterContext.Provider>
  )
}

function getStepHeader(
  step: CreateClusterStepKey,
  name: Nullable<string>
): { title: string; subtitle?: string } {
  switch (step) {
    case CreateClusterStepKey.Build:
      return {
        title: `Building ${name ?? 'your instance'}`,
        subtitle:
          'This takes a few minutes. You can close this tab and check progress from Instances.',
      }
    case CreateClusterStepKey.OpenConsole:
      return { title: 'Your console is ready' }
    default:
      return { title: 'Create instance' }
  }
}

export function clearCreateClusterCache() {
  localStorage.removeItem(`plural-${CUR_CREATE_CLUSTER_STEP_KEY}`)
  localStorage.removeItem(`plural-${CLOUD_OPTION_KEY}`)
  localStorage.removeItem(`plural-${HOSTING_OPTION_KEY}`)
  localStorage.removeItem(`plural-${CUR_CONSOLE_INSTANCE_KEY}`)
}

export function hasUnfinishedCreation() {
  const curConsoleInstanceId = getUnfinishedConsoleInstanceId()

  return (
    !!curConsoleInstanceId &&
    curConsoleInstanceId !== 'null' &&
    curConsoleInstanceId !== 'undefined'
  )
}

export function getUnfinishedConsoleInstanceId() {
  return localStorage
    .getItem(`plural-${CUR_CONSOLE_INSTANCE_KEY}`)
    ?.replace(/"/g, '')
}
