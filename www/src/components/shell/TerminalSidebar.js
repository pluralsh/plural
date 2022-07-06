import { useEffect, useState } from 'react'
import { CollapseIcon, ModalHeader } from 'pluralsh-design-system'
import { A, Accordion, Button, Div, ExtendTheme, Flex, Li, Modal, P, Ul } from 'honorable'
import { Fireworks } from 'fireworks-js/dist/react'

import usePrevious from '../../hooks/usePrevious'

import CodeLine from '../utils/CodeLine'

import { useOnboarded } from './onboarding/useOnboarded'

const sidebarWidth = 512

const steps = [
  {
    title: 'Install Plural Console',
    Component: Step1,
  },
  {
    title: 'Install Airbyte (optional)',
    Component: Step2,
  },
  {
    title: 'Deploy your cluster',
    Component: Step3,
  },
]

/* ---
  SIDEBAR
--- */

function TerminalSidebar({ isCheatsheet, shell, ...props }) {
  const { mutation, fresh } = useOnboarded()
  const [visible, setVisible] = useState(!fresh)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const shouldDislayCheatsheet = !fresh || isCheatsheet
  const { title, Component } = steps[stepIndex]

  useEffect(() => {
    setVisible(shouldDislayCheatsheet)
  }, [shouldDislayCheatsheet])

  function markDemoAsComplete() {
    setVisible(false)
    mutation()
  }

  function handlePrevious() {
    setStepIndex(x => Math.max(0, x - 1))
  }

  function handleNext() {
    setStepIndex(x => Math.min(steps.length - 1, x + 1))

    if (stepIndex === steps.length - 1) {
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
            {title}
          </P>
          <P
            body2
            color="text-xlight"
          >
            Step {stepIndex + 1} of {steps.length}
          </P>
        </Flex>
        <Div
          flexGrow={1}
          overflowY="auto"
        >
          <Component />
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
              Previous
            </Button>
          )}
          <Button
            primary
            onClick={handleNext}
          >
            {stepIndex === steps.length - 1 ? 'Complete demo' : 'Next'}
          </Button>
        </Flex>
      </>
    )
  }

  return (
    <>
      <Div
        width={visible ? sidebarWidth : 0}
        opacity={visible ? 1 : 0}
        marginRight={visible ? 0 : -32}
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
          {fresh ? renderDemo() : renderCheatsheet()}
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
        maxWidth={512}
        open={isModalOpen}
        onClose={handleModalClose}
        borderTop="4px solid border-success"
      >
        <ModalHeader>
          Next steps
        </ModalHeader>
        <P body1>
          Congratulations, you've installed your first Plural application!
          Next, you can view your deployed application in the Plural Console.
        </P>
        <Button
          primary
          width="100%"
          marginTop="large"
          as="a"
          href="https://plural.sh"
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
            <strong>wal_bucket:</strong> Our postgres operator automatically ships write ahead logs to s3 for point-in-time backup and restore.
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
            <strong>Plural OIDC:</strong> You can opt in to using Plural as an OpenID Connect provider, dramatically simplifying enabling secure login for your plural apps.
            This is highly recommended.
          </P>
          <P
            body1
            marginTop="small"
          >
            <strong>git_user:</strong> Plural will perform Git operations on your behalf to manage your config repository.
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
            <strong>private_key:</strong> This makes sure that your admin account has Read/Write access to the config repo.
            We recommend you stick with the default, unless you have compliance reasons for this file not existing here.
          </P>
          <P
            body1
            marginTop="small"
          >
            <strong>public_key:</strong> Similar to private_key, this makes sure that your admin account has Read/Write access to the DAG repo.
            We recommend you stick with the default, unless you have compliance reasons for this file not existing here.
          </P>
          <P
            body1
            marginTop="small"
          >
            <strong>passphrase:</strong> If you have encrypted your SSH key with a passphrase for extra security, you'll need to enter it here in order for Plural to use it for Git operations.
          </P>
        </Accordion>
      </ExtendTheme>
    </>
  )
}

/* ---
  DEMO STEP 2
--- */

function Step2() {
  return (
    <Div
      paddingVertical="medium"
      paddingHorizontal="large"
    >
      <P
        overline
        color="text-xlight"
      >
        installation
      </P>
      <P
        body1
        marginTop="medium"
      >
        Now that you've installed the Plural Console, it may be a good idea to install another app.
        For the sake of this demo we recommend installing an instance of Airbyte.
      </P>
      <P
        body1
        marginTop="medium"
      >
        To install Airbyte, simply run:
      </P>
      <CodeLine marginTop="medium">
        plural bundle install airbyte airbyte-gcp
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
        Now it's time for Plural to write all the Helm and Terraform required to bring up your Kubernetes cluster based on the config that you've entered.
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
        You can do a quick <strong>ls</strong> to check the files we've created for you, or you can go diretly to deploying them by running:
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
        Now grab a coffee or your favorite hot beverage while we wait for your cloud provider to provision your infrastructure.
      </P>
    </Div>
  )
}

/* ---
  CHEATSHEET
--- */

const SECTION_COMMANDS = 'SECTION_COMMANDS'
const SECTION_DEBUGGING = 'SECTION_DEBUGGING'
const SECTION_WORKSPACE = 'SECTION_WORKSPACE'

function Cheatsheet() {
  const [activeSection, setActiveSection] = useState(null)
  const previousActiveSection = usePrevious(activeSection) || null
  const displayedSection = activeSection || previousActiveSection

  return (
    <Div
      overflow="hidden"
      maxWidth="100%"
    >
      <Flex
        position="relative"
        align="flex-start"
        left={activeSection === null ? 0 : -sidebarWidth}
        transition="left 333ms ease"
      >
        <Div
          width={sidebarWidth}
          flexShrink={0}
        >
          <CheatsheetItem
            title="Commands"
            onClick={() => setActiveSection(SECTION_COMMANDS)}
          />
          <CheatsheetItem
            title="Debugging"
            onClick={() => setActiveSection(SECTION_DEBUGGING)}
          />
          <CheatsheetItem
            title="Workspace"
            onClick={() => setActiveSection(SECTION_WORKSPACE)}
          />
        </Div>
        <Div
          width={sidebarWidth}
          flexShrink={0}
          paddingVertical="medium"
        >
          <Button
            small
            tertiary
            onClick={() => setActiveSection(null)}
            marginLeft="medium"
          >
            Back to cheatsheet
          </Button>
          {displayedSection === SECTION_COMMANDS && (
            <CheatsheetCommands />
          )}
          {displayedSection === SECTION_DEBUGGING && (
            <CheatsheetDebugging />
          )}
          {displayedSection === SECTION_WORKSPACE && (
            <CheatsheetWorkspace />
          )}
        </Div>
      </Flex>
    </Div>
  )
}

function CheatsheetItem({ children, title, ...props }) {
  return (
    <Flex
      align="center"
      justify="space-between"
      paddingHorizontal="large"
      paddingVertical="medium"
      borderBottom="1px solid border"
      cursor="pointer"
      _hover={{ backgroundColor: 'fill-one-hover' }}
      {...props}
    >
      <P body1>
        {title}
      </P>
      <CollapseIcon
        transform="rotate(180deg)"
        color="text-xlight"
        size={8}
      />
    </Flex>
  )
}

function CheatsheetCommands() {
  return (
    <>
      CheatsheetCommands
    </>
  )
}

function CheatsheetDebugging() {
  return (
    <>
      CheatsheetDebugging
    </>
  )
}

function CheatsheetWorkspace() {
  return (
    <>
      CheatsheetWorkspace
    </>
  )
}

export default TerminalSidebar
