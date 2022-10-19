import { useMemo, useState } from 'react'
import {
  A, Button, Div, Flex, P,
} from 'honorable'
import {
  Callout,
  Codeline,
} from 'pluralsh-design-system'

import styled from 'styled-components'

import useOnboarded from './onboarding/useOnboarded'
import usePluralCommand from './usePluralCommand'
import {
  persistShouldUseOnboardingTerminalSidebar,
  retrieveApplications,
  retrieveConsole,
  retrieveShouldUseOnboardingTerminalSidebar,
  retrieveStack,
} from './persistance'
import OnboardingCompletionModal from './OnboardingCompletionModal'

const sidebarWidth = 420
const steps = [
  {
    title: 'Install Plural Console',
    Component: Step1,
  },
  {
    title: ({
      type, quick, appCount, stackName,
    }) => (quick || type !== 'stack' ? `Install your app${appCount > 1 ? 's' : ''}` : `Install ${stackName} stack`),
    Component: Step2,
  },
  {
    title: ({ appCount }) => `Deploy your app${appCount > 1 ? 's' : ''}`,
    Component: Step3,
  },
  {
    title: ({ appCount }) => `Check your app${appCount > 1 ? 's' : ''}`,
    Component: Step4,
  },
]

/* ---
  SIDEBAR
--- */

function TerminalSidebar({ shell, showCheatsheet, ...props }) {
  const [, refresh] = useState(true) // See below
  const { mutation, fresh } = useOnboarded()
  const shouldUseTerminalSidebar = retrieveShouldUseOnboardingTerminalSidebar()
  const { command, type: commandType, quick } = usePluralCommand(shell) // Could be put inside Step2 but stays here for eager loading
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const {
    workingSteps, skipConsoleInstall, appCount, stackName,
  } = useMemo(() => {
    const workingSteps = [...steps]
    const shouldInstallConsole = retrieveConsole()
    const applications = retrieveApplications()
    const stack = retrieveStack()

    const ret = {
      appCount: applications?.length,
      stackName: stack?.name,
      workingSteps,
    }

    if (applications.length === 1 && applications[0].name !== 'console') return { ...ret, skipConsoleInstall: false }
    if (shouldInstallConsole) return { ...ret, skipConsoleInstall: false }

    ret.workingSteps.shift()

    return {
      ...ret, skipConsoleInstall: true,
    }
  }, [])

  const { title, Component } = workingSteps[stepIndex]

  function markDemoAsComplete() {
    mutation()
    persistShouldUseOnboardingTerminalSidebar(false)
    refresh(x => !x) // Hack to refresh shouldUseTerminalSidebar
  }

  function handlePrevious() {
    setStepIndex(x => Math.max(0, x - 1))
  }

  function handleNext() {
    setStepIndex(x => Math.min(workingSteps.length - 1, x + 1))

    if (stepIndex === workingSteps.length - 1) {
      setIsModalOpen(true)
      markDemoAsComplete()
    }
  }

  function renderCheatsheet() {
    return (
      <Cheatsheet />
    )
  }

  function renderDemo() {
    return (
      <>
        <Flex
          align="center"
          justify="space-between"
          paddingVertical="medium"
          paddingHorizontal="large"
          borderBottom="1px solid border"
        >
          <P subtitle1>
            {typeof title === 'function' ? title({
              type: commandType, stackName, appCount, quick,
            }) : title}
          </P>
          <P
            body2
            color="text-xlight"
          >
            Step {stepIndex + 1} of {workingSteps.length}
          </P>
        </Flex>
        <Flex
          flexGrow={1}
          flexDirection="column"
          overflowY="auto"
          paddingHorizontal="large"
          paddingVertical="medium"
        >
          <Component
            command={command}
            quick={quick}
            commandType={commandType}
            skipConsoleInstall={skipConsoleInstall}
            shell={shell}
            appCount={appCount}
          />
        </Flex>
        <Flex
          align="center"
          paddingVertical="medium"
          paddingHorizontal="large"
          gap="medium"
          borderTop="1px solid border"
        >
          <Button
            tertiary
            onClick={markDemoAsComplete}
          >
            Skip Demo
          </Button>
          <Div flexGrow={1} />
          {stepIndex > 0 && (
            <Button
              secondary
              onClick={handlePrevious}
            >
              Back
            </Button>
          )}
          <Button
            primary
            onClick={handleNext}
          >
            {stepIndex === workingSteps.length - 1 ? 'Complete demo' : 'Next'}
          </Button>
        </Flex>
      </>
    )
  }

  return (
    <>
      <Div
        width={fresh || showCheatsheet ? sidebarWidth : '0'}
        opacity={fresh || showCheatsheet ? '1' : '0'}
        marginRight={fresh || showCheatsheet ? 'large' : '0'}
        transition="width 666ms ease, opacity 666ms linear, margin-right 666ms linear"
        maxHeight="100%"
        overflowX="auto"
        {...props}
      >
        <Flex
          width={sidebarWidth}
          height="100%"
          backgroundColor="fill-one"
          border="1px solid border"
          borderRadius="large"
          direction="column"
        >
          {fresh || shouldUseTerminalSidebar ? renderDemo() : showCheatsheet ? renderCheatsheet() : null}
        </Flex>
      </Div>
      <OnboardingCompletionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        skipConsoleInstall={skipConsoleInstall}
        shell={shell}
      />
    </>
  )
}

/* ---
  DEMO STEP 1
--- */

// const extendedTheme = {
//   Accordion: {
//     Root: [
//       {
//         paddingLeft: 8,
//         paddingRight: 8,
//       },
//     ],
//     Title: [
//       {
//         subtitle2: true,
//       },
//     ],
//   },
// }

// function Guidance() {
//   return (
//     <ExtendTheme theme={extendedTheme}>
//       <Accordion
//         ghost
//         title="Key terms"
//       >
//         <StepP>
//           <strong>vpc_name:</strong> The vpc name we'll create for your cluster.
//           This will be a separate vpc and should be named distinctly from any others in your account.
//         </P>
//         <P
//           body1
//           marginTop="small"
//         >
//           <strong>wal_bucket:</strong> Our postgres operator automatically ships write ahead logs to s3 for
//           point-in-time backup and restore.
//         </P>
//         <P
//           body1
//           marginTop="small"
//         >
//           <strong>dns hostnames:</strong> You can specify any hostname under the plural dns domain you entered (xxx).
//           Be sure to type the full name since we do validate they are formatted correctly.
//         </P>
//         <P
//           body1
//           marginTop="small"
//         >
//           <strong>Plural OIDC:</strong> You can opt in to using Plural as an OpenID Connect provider, dramatically
//           simplifying enabling secure login for your plural apps.
//           This is highly recommended.
//         </P>
//         <P
//           body1
//           marginTop="small"
//         >
//           <strong>git_user:</strong> Plural will perform Git operations on your behalf to manage your config
//           repository.
//           Just use your GitHub username here, unless you have a dedicated user for Ops.
//         </P>
//         <P
//           body1
//           marginTop="small"
//         >
//           <strong>git_email:</strong> Use the email tied to the account associated with git_user.
//         </P>
//         <P
//           body1
//           marginTop="small"
//         >
//           <strong>admin_name:</strong> Use your naming preference for admin accounts.
//           No need to reinvent the wheel, admin is fine too.
//         </P>
//         <P
//           body1
//           marginTop="small"
//         >
//           <strong>private_key:</strong> This makes sure that your admin account has Read/Write access to the config
//           repo.
//           We recommend you stick with the default, unless you have compliance reasons for this file not existing here.
//         </P>
//         <P
//           body1
//           marginTop="small"
//         >
//           <strong>public_key:</strong> Similar to private_key, this makes sure that your admin account has Read/Write
//           access to the DAG repo.
//           We recommend you stick with the default, unless you have compliance reasons for this file not existing here.
//         </P>
//         <P
//           body1
//           marginTop="small"
//         >
//           <strong>passphrase:</strong> If you have encrypted your SSH key with a passphrase for extra security, you'll
//           need to enter it here in order for Plural to use it for Git operations.
//         </P>
//       </Accordion>
//     </ExtendTheme>
//   )
// }

function WizardDocs() {
  return (
    <>
      <StepP>
        Our CLI will lead you through a brief install wizard to make sure
        everything is configured properly. If you need more detailed guidance
        for these steps, refer to{' '}
        <A
          inline
          target="_blank"
          href="https://docs.plural.sh/applications/repositories/console#setup-configuration"
        >
          our documentation
        </A>
        .
      </StepP>
      <StepP>
        After successfully running this command, move on to the next step.
      </StepP>
    </>
  )
}

const StepSection = styled.div(({ theme }) => ({
  // padding: `${theme.spacing.small}px ${theme.spacing.medium}px`,
  '&:not(:first-child)': {
    paddingTop: theme.spacing.large,
  },
  '&:not(:last-child)': {
    paddingBottom: theme.spacing.medium,
    borderBottom: theme.borders.default,
  },
}))

const StepP = styled.p(({ theme }) => ({
  margin: 0,
  ...theme.partials.text.body2,
  '&:not(:last-of-type)': {
    marginBottom: theme.spacing.medium,
  },
}))

const CalloutArea = styled(StepSection)(_ => ({
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
  justifyContent: 'end',
}))

function Callout1() {
  return (
    <Callout
      severity="info"
      title="Does the cloud shell look weird?"
    >
      Give the page a quick refresh or click “repair viewport” in the top right.
    </Callout>
  )
}

function Step1({ shell }) {
  return (
    <>
      <div>
        <StepSection>
          <StepP>
            Welcome to the cloud shell! After your shell initializes, it’s time
            to install your first bundle.
          </StepP>
        </StepSection>
        <StepSection>
          <StepP>Run this command:</StepP>
          <Codeline marginTop="xsmall">
            {`plural bundle install console console-${
              shell?.provider?.toLowerCase() || 'gcp'
            }`}
          </Codeline>
        </StepSection>
        <StepSection>
          <WizardDocs />
        </StepSection>
      </div>
      <CalloutArea>
        <Callout1 />
      </CalloutArea>
    </>
  )
}

/* ---
  DEMO STEP 2
--- */

function Step2({ command, quick }) {
  return (
    <>
      <div>
        {quick && (
          <StepSection>
            <StepP>
              We’ve collected all of your selected apps into a temporary stack
              command.
            </StepP>
          </StepSection>
        )}
        <StepSection>
          <StepP>Run this command:</StepP>
          <Codeline marginTop="xsmall">{command}</Codeline>
        </StepSection>
        <StepSection>
          <WizardDocs />
        </StepSection>
      </div>
      <CalloutArea>
        <Callout1 />
      </CalloutArea>
    </>
  )
}

/* ---
  DEMO STEP 3
--- */

function Step3({ appCount }) {
  return (
    <>
      <div>
        <StepSection>
          <StepP>
            With {appCount > 1 ? 'all of your apps' : 'your app'} installed, all
            that’s left to do is build and deploy {appCount > 1 ? 'them' : 'it'}{' '}
            to Kubernetes.
          </StepP>
        </StepSection>
        <StepSection>
          <StepP>Run these commands sequentially:</StepP>
          <Codeline marginTop="xsmall">plural build</Codeline>
          <Codeline marginTop="xsmall">
            plural deploy --commit "first commit"
          </Codeline>
        </StepSection>
        <StepSection>
          <StepP>
            These commands may take upwards of fifteen to complete as the cloud
            provider provisions your infrastructure.
          </StepP>
        </StepSection>
      </div>
      <CalloutArea>
        <Callout1 />
      </CalloutArea>
    </>
  )
}

/* ---
  DEMO STEP 4
--- */

function Step4({ appCount }) {
  return (
    <>
      <div>
        <StepSection>
          <StepP>
            Before we finish up, let’s make sure your {appCount > 1 ? 'applications are' : 'application is'} up and
            running.
          </StepP>
          <StepP>
            The command below will check the health of any app you installed.
          </StepP>
          <StepP>Run this command:</StepP>
          <Codeline marginTop="xsmall">{'plural watch <app-name>'}</Codeline>
        </StepSection>
      </div>
      <CalloutArea>
        <Callout
          severity="warning"
          title="Encountering any errors?"
        >
          Check out{' '}
          <A
            inline
            target="_blank"
            href="https://docs.plural.sh"
          >
            our documentation
          </A>{' '}
          or contact us on{' '}
          <A
            inline
            target="_blank"
            href="https://discord.gg/pluralsh"
          >
            Discord
          </A>{' '}
          for support.
        </Callout>
      </CalloutArea>
    </>
  )
}

/* ---
  CHEATSHEET
--- */

function Cheatsheet() {
  return (
    <Div
      overflow="hidden"
      maxWidth="100%"
    >
      <Flex
        position="relative"
        align="flex-start"
      >
        <Div
          width={sidebarWidth}
          flexShrink={0}
          paddingVertical="medium"
        >
          <CheatsheetCommands />
        </Div>
      </Flex>
    </Div>
  )
}

function CheatsheetCommands() {
  const commands = [
    {
      command: 'repos list',
      description:
        'Shows all available applications on the platform (repos) and the cloud providers they can be deployed to (using a bundle).',
    },
    {
      command: 'bundle list <repo>',
      description: 'Shows all available bundles for repository.',
    },
    {
      command: 'bundle install <repo> <bundle>',
      description: (
        <>
          E.g. <strong>plural bundle install dagster dagster-gcp</strong> would
          configure Dagster for deployment to GCP.
        </>
      ),
    },
    {
      command: 'build',
      description: 'Generates all the infrastructure as code.',
    },
    {
      command: 'deploy',
      description: 'Deploys all installed bundles.',
    },
    {
      command: 'watch <repo>',
      description: 'Watches applications until they become ready.',
    },
  ]

  return (
    <>
      <P
        paddingHorizontal="medium"
        overline
        color="text-xlight"
      >
        COMMANDS
      </P>
      <Flex
        direction="column"
        overflow="auto"
        paddingBottom="small"
      >
        {commands.map(c => (
          <CheatsheetCommand
            key={c.command}
            command={c.command}
            description={c.description}
          />
        ))}
      </Flex>
    </>
  )
}

function CheatsheetCommand({ command, description }) {
  return (
    <Flex
      borderBottom="1px solid border"
      padding="small"
      paddingLeft="medium"
    >
      <P
        flex="50%"
        body2
      >
        <strong>plural {command}</strong>
      </P>
      <P
        flex="50%"
        body2
      >
        {description}
      </P>
    </Flex>
  )
}

export default TerminalSidebar
