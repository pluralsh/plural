import {
  Button,
  ReturnIcon,
  SendMessageIcon,
  Stepper,
} from '@pluralsh/design-system'
import { useNavigate } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import { ReactElement, useMemo, useState } from 'react'

import OnboardingCard from 'components/shell/onboarding/OnboardingCard'

import {
  ConsoleInstanceStatus,
  ConsoleInstanceType,
  useConsoleInstanceQuery,
} from 'generated/graphql'

import { GqlError } from 'components/utils/Alert'

import usePersistedState from 'hooks/usePersistedState'

import { ConsoleCreationStatus } from './ConsoleCreationStatus'
import { CreateClusterActions } from './CreateClusterActions'
import {
  CloudOption,
  CreateClusterContext,
  CreateClusterContextType,
  CreateClusterStepKey,
  cloudSteps,
  localSteps,
} from './CreateClusterWizard'

export const CUR_CREATE_CLUSTER_STEP_KEY = 'cur-create-cluster-step'
export const CLOUD_OPTION_KEY = 'cloud-option'
export const HOSTING_OPTION_KEY = 'hosting-option'
export const CUR_CONSOLE_INSTANCE_KEY = 'cur-console-instance-id'

export function CreateCluster() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [curStep, setCurStep] = usePersistedState<CreateClusterStepKey>(
    CUR_CREATE_CLUSTER_STEP_KEY,
    CreateClusterStepKey.ChooseCloud
  )
  const [cloudOption, setCloudOption] = usePersistedState<CloudOption>(
    CLOUD_OPTION_KEY,
    'local'
  )
  const [hostingOption, setHostingOption] =
    usePersistedState<ConsoleInstanceType>(
      HOSTING_OPTION_KEY,
      ConsoleInstanceType.Shared
    )
  const [finishEnabled, setFinishEnabled] = useState(false)
  const [continueBtn, setContinueBtn] = useState<ReactElement | undefined>()
  const [consoleInstanceId, setConsoleInstanceId] = usePersistedState<
    Nullable<string>
  >(CUR_CONSOLE_INSTANCE_KEY, null)

  const steps = cloudOption === 'local' ? localSteps : cloudSteps
  const curStepIndex = steps.findIndex((step) => step.key === curStep)

  const { data, error } = useConsoleInstanceQuery({
    variables: {
      id: consoleInstanceId ?? '',
    },
    skip: !consoleInstanceId,
    fetchPolicy: 'cache-and-network',
    pollInterval: 10_000,
  })

  const context: CreateClusterContextType = useMemo(
    () => ({
      curStep,
      setCurStep,
      cloudOption,
      setCloudOption,
      hostingOption,
      setHostingOption,
      finishEnabled,
      setFinishEnabled,
      continueBtn,
      setContinueBtn,
      consoleInstanceId,
      setConsoleInstanceId,
      consoleUrl: data?.consoleInstance?.url,
      isCreatingInstance:
        !!consoleInstanceId &&
        !(
          data?.consoleInstance?.console?.pingedAt &&
          data.consoleInstance.status === ConsoleInstanceStatus.Provisioned
        ),
    }),
    [
      curStep,
      setCurStep,
      cloudOption,
      setCloudOption,
      hostingOption,
      setHostingOption,
      finishEnabled,
      continueBtn,
      consoleInstanceId,
      setConsoleInstanceId,
      data?.consoleInstance?.url,
      data?.consoleInstance?.console?.pingedAt,
      data?.consoleInstance?.status,
    ]
  )

  return (
    <CreateClusterContext.Provider value={context}>
      <MainWrapperSC>
        <SidebarWrapperSC>
          <Button
            css={{ width: '100%' }}
            secondary
            startIcon={<ReturnIcon />}
            onClick={() => navigate('/overview/clusters/plural-cloud')}
          >
            Back home
          </Button>
          <Stepper
            vertical
            steps={steps}
            stepIndex={curStepIndex}
          />
          {error ? (
            <GqlError error={error} />
          ) : (
            data?.consoleInstance && (
              <ConsoleCreationStatus consoleInstance={data.consoleInstance} />
            )
          )}
        </SidebarWrapperSC>
        <ContentWrapperSC>
          <ContentHeaderSC>
            <span css={theme.partials.text.title2}>Create Cluster</span>
            <Button
              secondary
              startIcon={<SendMessageIcon />}
              as="a"
              href="https://plural.sh/contact-sales"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact sales
            </Button>
          </ContentHeaderSC>
          <OnboardingCard title={steps[curStepIndex]?.stepTitle}>
            {steps[curStepIndex]?.component}
            <CreateClusterActions />
          </OnboardingCard>
        </ContentWrapperSC>
      </MainWrapperSC>
    </CreateClusterContext.Provider>
  )
}

export function clearCreateClusterState() {
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

const MainWrapperSC = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing.xlarge,
  padding: theme.spacing.large,
  height: '100%',
  overflow: 'auto',
  '&::after': {
    // makes the spacing look a little nicer
    content: '""',
    flex: 0.35,
  },
}))

const SidebarWrapperSC = styled.div(({ theme }) => ({
  display: 'flex',
  width: 300,
  height: 'min-content',
  flexDirection: 'column',
  gap: theme.spacing.xlarge,
}))

const ContentWrapperSC = styled.div(({ theme }) => ({
  display: 'flex',
  margin: 'auto',
  minWidth: 600,
  maxWidth: 720,
  flexDirection: 'column',
  gap: theme.spacing.xlarge,
}))

const ContentHeaderSC = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
})
