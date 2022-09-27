import { useMemo, useState } from 'react'
import {
  A,
  Accordion,
  Button,
  Div,
  ExtendTheme,
  Flex,
  Li,
  P,
  Ul,
} from 'honorable'
import { Fireworks } from 'fireworks-js/dist/react'
import { Chip, InfoIcon, Modal } from 'pluralsh-design-system'

import CodeLine from '../utils/CodeLine'

import useOnboarded from './onboarding/useOnboarded'
import usePluralCommand from './usePluralCommand'
import { retrieveApplications, retrieveConsole } from './persistance'

const sidebarWidth = 512
const steps = [
  {
    title: 'Install Plural Console',
    Component: Step1,
  },
  {
    title: type => (type === 'stack' ? 'Install your stack' : 'Install your application'),
    Component: Step2,
  },
  {
    title: 'Deploy your cluster',
    Component: Step3,
  },
  {
    title: 'Run plural watch',
    Component: Step4,
  },
]

/* ---
  SIDEBAR
--- */

function TerminalSidebar({ shell, showCheatsheet, ...props }) {
  const { mutation, fresh } = useOnboarded()
  const { command, type: commandType } = usePluralCommand() // Could be put inside Step2 but stays here for eager loading
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const workingSteps = useMemo(() => {
    const workingSteps = [...steps]
    const shouldInstallConsole = retrieveConsole()
    const applications = retrieveApplications()

    if (applications.length === 1 && applications[0].name !== 'console') return workingSteps
    if (shouldInstallConsole) return workingSteps

    workingSteps.shift()

    return workingSteps
  }, [])

  console.log('workingSteps', workingSteps)

  const { title, Component } = workingSteps[stepIndex]

  function markDemoAsComplete() {
    mutation()
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

  function handleModalClose() {
    setIsModalOpen(false)
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
            {typeof title === 'function' ? title(commandType) : title}
          </P>
          <P
            body2
            color="text-xlight"
          >
            Step {stepIndex + 1} of {workingSteps.length}
          </P>
        </Flex>
        <Div
          flexGrow={1}
          overflowY="auto"
        >
          <Component
            command={command}
            commandType={commandType}
          />
        </Div>
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
        marginRight={fresh || showCheatsheet ? 'xlarge' : '0'}
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
          {fresh ? renderDemo() : showCheatsheet ? renderCheatsheet() : null}
        </Flex>
      </Div>
      {isModalOpen && (
        <Fireworks
          options={{}}
          style={{
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            background: 'transparent',
            zIndex: 999,
          }}
        />
      )}
      <Modal
        header="Next steps"
        width={512}
        maxWidth={512}
        open={isModalOpen}
        onClose={handleModalClose}
        borderTop="4px solid border-success"
      >
        <P body1>
          Congratulations, you've installed your first Plural application!
          Next, you can view your deployed application in the Plural Console.
        </P>
        <Button
          primary
          width="100%"
          marginTop="large"
          as="a"
          href={`https://console.${shell.subdomain}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to Plural Console
        </Button>
        <P
          body2
          marginTop="large"
          textAlign="center"
        >
          Need support?&nbsp;
          <A
            inline
            href="https://discord.gg/pluralsh"
            rel="noopener noreferrer"
            target="_blank"
          >
            Ping us on Discord
          </A>
        </P>
      </Modal>
    </>
  )
}

/* ---
  DEMO STEP 1
--- */

const extendedTheme = {
  Accordion: {
    Root: [
      {
        paddingLeft: 8,
        paddingRight: 8,
      },
    ],
    Title: [
      {
        subtitle2: true,
      },
    ],
  },
}

function Step1() {
  return (
    <>
      <Div
        paddingVertical="medium"
        paddingHorizontal="large"
        borderBottom="1px solid border"
      >
        <P
          overline
          color="text-xlight"
        >
          bundle install
        </P>
        <P
          body1
          marginTop="medium"
        >
          The Plural Console provides you with out-of-the-box monitoring and upgrading functionality.
          It will also give you access to console.xxx.onplural.sh after the demo is complete.
        </P>
        <P
          body1
          marginTop="medium"
        >
          To begin, run this one-line command:
        </P>
        <CodeLine marginTop="medium">
          plural bundle install console console-gcp
        </CodeLine>
        <P
          body1
          marginTop="medium"
        >
          After running this command you will be prompted through a setup wizard.
          Below are some key terms that will help you complete this step.
        </P>
      </Div>
      <ExtendTheme theme={extendedTheme}>
        <Accordion
          ghost
          title="Key terms"
        >
          <P body1>
            <strong>vpc_name:</strong> The vpc name we'll create for your cluster.
            This will be a separate vpc and should be named distinctly from any others in your account.
          </P>
          <P
            body1
            marginTop="small"
          >
            <strong>wal_bucket:</strong> Our postgres operator automatically ships write ahead logs to s3 for
            point-in-time backup and restore.
          </P>
          <P
            body1
            marginTop="small"
          >
            <strong>dns hostnames:</strong> You can specify any hostname under the plural dns domain you entered (xxx).
            Be sure to type the full name since we do validate they are formatted correctly.
          </P>
          <P
            body1
            marginTop="small"
          >
            <strong>Plural OIDC:</strong> You can opt in to using Plural as an OpenID Connect provider, dramatically
            simplifying enabling secure login for your plural apps.
            This is highly recommended.
          </P>
          <P
            body1
            marginTop="small"
          >
            <strong>git_user:</strong> Plural will perform Git operations on your behalf to manage your config
            repository.
            Just use your GitHub username here, unless you have a dedicated user for Ops.
          </P>
          <P
            body1
            marginTop="small"
          >
            <strong>git_email:</strong> Use the email tied to the account associated with git_user.
          </P>
          <P
            body1
            marginTop="small"
          >
            <strong>admin_name:</strong> Use your naming preference for admin accounts.
            No need to reinvent the wheel, admin is fine too.
          </P>
          <P
            body1
            marginTop="small"
          >
            <strong>private_key:</strong> This makes sure that your admin account has Read/Write access to the config
            repo.
            We recommend you stick with the default, unless you have compliance reasons for this file not existing here.
          </P>
          <P
            body1
            marginTop="small"
          >
            <strong>public_key:</strong> Similar to private_key, this makes sure that your admin account has Read/Write
            access to the DAG repo.
            We recommend you stick with the default, unless you have compliance reasons for this file not existing here.
          </P>
          <P
            body1
            marginTop="small"
          >
            <strong>passphrase:</strong> If you have encrypted your SSH key with a passphrase for extra security, you'll
            need to enter it here in order for Plural to use it for Git operations.
          </P>
        </Accordion>
      </ExtendTheme>
    </>
  )
}

/* ---
  DEMO STEP 2
--- */

function Step2({
  command,
  commandType,
}) {
  return (
    <Div
      paddingVertical="medium"
      paddingHorizontal="large"
    >
      <P
        overline
        color="text-xlight"
      >
        Installation
      </P>
      <P
        body1
        marginTop="medium"
      >
        Now that you've installed the Plural Console,
        it's time to install the {commandType === 'stack' ? 'stack' : 'application'} you selected earlier in the demo.
      </P>
      <P
        body1
        marginTop="medium"
      >
        Copy and paste these commands into your cloud shell to begin:
      </P>
      <CodeLine marginTop="medium">
        {command}
      </CodeLine>
    </Div>
  )
}

/* ---
  DEMO STEP 3
--- */

function Step3() {
  return (
    <Div
      paddingVertical="medium"
      paddingHorizontal="large"
    >
      <P
        overline
        color="text-xlight"
      >
        plural build & deploy
      </P>
      <P
        body1
        marginTop="medium"
      >
        Now it's time for Plural to write all the Helm and Terraform required to bring up your Kubernetes cluster based
        on the config that you've entered.
      </P>
      <P
        body1
        marginTop="medium"
      >
        Start by running:
      </P>
      <CodeLine marginTop="medium">
        plural build
      </CodeLine>
      <P
        body1
        marginTop="medium"
      >
        You can do a quick <strong>ls</strong> to check the files we've created for you, or you can go directly to
        deploying them by running:
      </P>
      <CodeLine marginTop="medium">
        plural deploy --commit "your message"
      </CodeLine>
      <P
        body1
        marginTop="medium"
      >
        This will do two things:
        <Ul marginVertical="medium">
          <Li>
            Push your configuration files created in the Cloud Shell to your newly created repository
          </Li>
          <Li>
            Deploy your Kubernetes cluster and the applications you've configured
          </Li>
        </Ul>
        Now grab a coffee or your favorite hot beverage while we wait for your cloud provider to provision your
        infrastructure.
      </P>
    </Div>
  )
}

/* ---
  DEMO STEP 4
--- */

function Step4() {
  return (
    <Div
      paddingVertical="medium"
      paddingHorizontal="large"
    >
      <Flex
        backgroundColor="fill-two"
        padding="medium"
        borderRadius="medium"
        borderLeft="medium solid"
        borderColor="text-warning-light"
        gap="small"
      >
        <InfoIcon
          alignSelf="flex-start"
          color="text-warning-light"
          height="24px"
        />
        <Flex
          direction="column"
          gap="xxsmall"
        >
          <P
            body1
            bold
          >Wait for your cluster to build
          </P>
          <P
            body2
            color="text-light"
          >After
            <Chip
              size="small"
              hue="lighter"
              marginHorizontal="xxsmall"
            >
              plural deploy
            </Chip>
            is done, all your applications and the Plural Console will
            be up and ready to access.
          </P>
        </Flex>
      </Flex>
      <P
        body1
        color="text-light"
        marginTop="medium"
      >
        Take a nice stretch break as your deployment finishes, then run the command below to check whether or not your cluster is up and running.
      </P>
      <P
        body1
        color="text-light"
        marginTop="medium"
      >
        Check the health of your cluster:
      </P>
      <CodeLine marginTop="xsmall">plural watch</CodeLine>
    </Div>
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
  const commands = [{
    command: 'repos list',
    description: 'Shows all available applications on the platform (repos) and the cloud providers they can be deployed to (using a bundle).',
  },
  {
    command: 'bundle list <repo>',
    description: 'Shows all available bundles for repository.',
  },
  {
    command: 'bundle install <repo> <bundle>',
    description: <>E.g. <strong>plural bundle install dagster dagster-gcp</strong> would configure Dagster for deployment to GCP.</>,
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
  }]

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
