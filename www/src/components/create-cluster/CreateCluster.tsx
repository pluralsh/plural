import {
  Button,
  Flex,
  IconFrame,
  PencilIcon,
  ReturnIcon,
  SendMessageIcon,
  Stepper,
} from '@pluralsh/design-system'
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
import { Link } from 'react-router-dom'

export const CUR_CREATE_CLUSTER_STEP_KEY = 'cur-create-cluster-step'
export const CLOUD_OPTION_KEY = 'cloud-option'
export const HOSTING_OPTION_KEY = 'hosting-option'
export const CUR_CONSOLE_INSTANCE_KEY = 'cur-console-instance-id'
const TTL_KEY = 'create-cluster-ttl'

export function CreateCluster() {
  const theme = useTheme()
  const [curStep, setCurStep] = usePersistedState<CreateClusterStepKey>(
    CUR_CREATE_CLUSTER_STEP_KEY,
    CreateClusterStepKey.ChooseCloud,
    { key: TTL_KEY }
  )
  const [cloudOption, setCloudOption] = usePersistedState<CloudOption>(
    CLOUD_OPTION_KEY,
    'local',
    { key: TTL_KEY }
  )
  const [hostingOption, setHostingOption] =
    usePersistedState<ConsoleInstanceType>(
      HOSTING_OPTION_KEY,
      ConsoleInstanceType.Shared,
      { key: TTL_KEY }
    )
  const [finishEnabled, setFinishEnabled] = useState(false)
  const [continueBtn, setContinueBtn] = useState<ReactElement | undefined>()
  const [consoleInstanceId, setConsoleInstanceId] = usePersistedState<
    Nullable<string>
  >(CUR_CONSOLE_INSTANCE_KEY, null, { key: TTL_KEY })

  const steps = cloudOption === 'local' ? localSteps : cloudSteps
  const curStepIndex = steps.findIndex((step) => step.key === curStep)

  const { data, error } = useConsoleInstanceQuery({
    variables: { id: consoleInstanceId ?? '' },
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
        data?.consoleInstance?.status !== ConsoleInstanceStatus.Provisioned,
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

  const showClearButton =
    cloudOption === 'cloud' &&
    (curStep === CreateClusterStepKey.InstallCli ||
      curStep === CreateClusterStepKey.Authentication)

  return (
    <CreateClusterContext.Provider value={context}>
      <MainWrapperSC>
        <SidebarWrapperSC>
          <Flex
            gap="small"
            width="100%"
          >
            <Button
              as={Link}
              to="/overview"
              secondary
              startIcon={<ReturnIcon />}
              style={{ flex: 1 }}
            >
              Back home
            </Button>
            {showClearButton && (
              <IconFrame
                clickable
                type="floating"
                size="large"
                icon={<PencilIcon css={{ width: 16 }} />}
                tooltip="Create a new instance (this one will continue provisioning)"
                onClick={() => {
                  clearCreateClusterCache()
                  setCurStep(CreateClusterStepKey.ChooseCloud)
                  setCloudOption('cloud')
                  setConsoleInstanceId(null)
                  setContinueBtn(undefined)
                }}
                css={{ flexShrink: 0 }}
              />
            )}
          </Flex>
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
              href="https://www.plural.sh/contact"
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
  height: 'fit-content',
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
