import {
  Button,
  Flex,
  ReturnIcon,
  SendMessageIcon,
  Stepper,
} from '@pluralsh/design-system'
import { useNavigate } from 'react-router-dom'
import { useTheme } from 'styled-components'

import { useState } from 'react'

import {
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
  const steps = hostingOption === 'local' ? localSteps : cloudSteps
  const curStepIndex = steps.findIndex((step) => step.key === curStep)

  return (
    <Flex
      gap="xlarge"
      padding={theme.spacing.large}
    >
      <Flex
        width={256}
        flexDirection="column"
        gap="large"
      >
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
      </Flex>
      <Flex
        width={600}
        flexDirection="column"
        gap="large"
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
        >
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
        </Flex>
        {steps[curStepIndex]?.component}
      </Flex>
    </Flex>
  )
}
