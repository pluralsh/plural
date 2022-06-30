import { Accordion, Button, Div, ExtendTheme, Flex, P } from 'honorable'
import { useState } from 'react'

import CodeLine from '../utils/CodeLine'

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
function TerminalSidebar(props) {
  const [stepIndex, setStepIndex] = useState(0)

  const { title, Component } = steps[stepIndex]

  function handlePrevious() {
    setStepIndex(x => Math.max(0, x - 1))
  }

  function handleNext() {
    setStepIndex(x => Math.min(steps.length - 1, x + 1))
  }

  return (
    <Flex
      width={512}
      backgroundColor="fill-one"
      border="1px solid border"
      borderRadius="large"
      direction="column"
      maxHeight="100%"
      {...props}
    >
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
        <Button tertiary>
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
          Next
        </Button>
      </Flex>
    </Flex>
  )
}

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

function Step2() {
  return (
    <>
      foo
    </>
  )
}

function Step3() {
  return (
    <>
      foo
    </>
  )
}

export default TerminalSidebar
