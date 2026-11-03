import { ArrowTopRightIcon, Button } from '@pluralsh/design-system'
import styled from 'styled-components'

import { useCurrentUser } from 'contexts/CurrentUserContext'

import { CreateClusterActions } from '../CreateClusterActions'
import { useCreateClusterContext } from '../CreateClusterWizard'
import { InstanceStatus } from '../InstanceSummary'
import {
  InfoNote,
  LabeledCodeline,
  NavPath,
  NextStepsHero,
  NumberedStep,
  NumberedStepsSC,
} from '../NextSteps'
import { BodyTextSC, InlineCodeSC } from '../shared'

const toConsoleUrl = (url: Nullable<string>) =>
  url ? `https://${url.replace(/^https?:\/\//, '')}` : ''

export function OpenConsoleStep() {
  const { email } = useCurrentUser()
  const { consoleInstance, finish } = useCreateClusterContext()
  const consoleUrl = toConsoleUrl(consoleInstance?.url)

  return (
    <>
      <NextStepsHero
        title={`${consoleInstance?.name ?? 'Your console'} is live`}
        adornment={<InstanceStatus running />}
        description="Three quick steps and your cloud is connected."
      />
      <LabeledCodeline label="Console">{consoleUrl}</LabeledCodeline>
      <NumberedStepsSC>
        <NumberedStep
          number={1}
          active
          title="Open your console"
        >
          <BodyTextSC>
            Log in as <strong>{email}</strong>, with the same password or SSO
            provider you signed up with.
          </BodyTextSC>
          <div>
            <Button
              as="a"
              href={consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<ArrowTopRightIcon />}
              disabled={!consoleUrl}
            >
              Open console
            </Button>
          </div>
        </NumberedStep>
        <NumberedStep
          number={2}
          title="Create an access token"
        >
          <BodyTextSC>In the console, open</BodyTextSC>
          <NavPath segments={['Profile', 'Access tokens', 'Create token']} />
          <MutedTextSC>
            Copy it somewhere handy. You'll paste it in the next step.
          </MutedTextSC>
        </NumberedStep>
        <NumberedStep
          number={3}
          title="Connect your cloud"
          last
        >
          <BodyTextSC>
            Run this on your machine and paste the token when asked. It connects
            your cloud and creates a management cluster.
          </BodyTextSC>
          <LabeledCodeline label="$">plural up --cloud</LabeledCodeline>
          <MutedTextSC>
            Need the CLI first? Run{' '}
            <InlineCodeSC>brew install pluralsh/plural/plural</InlineCodeSC>
          </MutedTextSC>
          <InfoNote>
            Takes about 10 minutes, longer on AWS. Keep the terminal open until
            it finishes.
          </InfoNote>
        </NumberedStep>
      </NumberedStepsSC>
      <CreateClusterActions>
        <Button
          secondary
          onClick={finish}
        >
          Back to Instances
        </Button>
      </CreateClusterActions>
    </>
  )
}

const MutedTextSC = styled(BodyTextSC)(({ theme }) => ({
  color: theme.colors['text-xlight'],
}))
