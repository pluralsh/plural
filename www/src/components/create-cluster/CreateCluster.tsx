import {
  Button,
  ReturnIcon,
  SendMessageIcon,
  Stepper,
} from '@pluralsh/design-system'
import { useNavigate } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import { useMemo, useState } from 'react'

import OnboardingCard from 'components/shell/onboarding/OnboardingCard'

import { CreateClusterActions } from './CreateClusterActions'
import {
  CreateClusterContext,
  CreateClusterStepKey,
  cloudSteps,
  localSteps,
} from './CreateClusterWizard'

export function CreateCluster() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [curStep, setCurStep] = useState<CreateClusterStepKey>(
    CreateClusterStepKey.HostingOptions
  )
  const [hostingOption, setHostingOption] = useState<'local' | 'cloud'>('local')
  const [finishEnabled, setFinishEnabled] = useState(false)
  const steps = hostingOption === 'local' ? localSteps : cloudSteps
  const curStepIndex = steps.findIndex((step) => step.key === curStep)

  const context = useMemo(
    () => ({
      curStep,
      setCurStep,
      hostingOption,
      setHostingOption,
      finishEnabled,
      setFinishEnabled,
    }),
    [
      curStep,
      setCurStep,
      hostingOption,
      setHostingOption,
      finishEnabled,
      setFinishEnabled,
    ]
  )

  return (
    <MainWrapperSC>
      <SidebarWrapperSC>
        <Button
          css={{ width: '100%' }}
          secondary
          startIcon={<ReturnIcon />}
          onClick={() => navigate('/overview')}
        >
          Back home
        </Button>
        <Stepper
          vertical
          steps={steps}
          stepIndex={curStepIndex}
        />
      </SidebarWrapperSC>
      <ContentWrapperSC>
        <ContentHeaderSC>
          <span css={theme.partials.text.title2}>Create Cluster</span>
          <Button
            secondary
            startIcon={<SendMessageIcon />}
            as="a"
            href="mailto:sales@plural.sh"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact sales
          </Button>
        </ContentHeaderSC>
        <CreateClusterContext.Provider value={context}>
          <OnboardingCard title={steps[curStepIndex]?.stepTitle}>
            {steps[curStepIndex]?.component}
            <CreateClusterActions />
          </OnboardingCard>
        </CreateClusterContext.Provider>
      </ContentWrapperSC>
    </MainWrapperSC>
  )
}

const MainWrapperSC = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing.xlarge,
  padding: theme.spacing.large,
  '::after': {
    // makes the spacing look a little nicer
    content: '""',
    flex: 0.35,
  },
}))

const SidebarWrapperSC = styled.div(({ theme }) => ({
  display: 'flex',
  minWidth: 256,
  flexDirection: 'column',
  gap: theme.spacing.large,
}))

const ContentWrapperSC = styled.div(({ theme }) => ({
  display: 'flex',
  margin: 'auto',
  minWidth: 600,
  maxWidth: 720,
  flexDirection: 'column',
  gap: theme.spacing.large,
}))

const ContentHeaderSC = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
})
