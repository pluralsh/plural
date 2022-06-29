import { Button, Div, Flex, P } from 'honorable'
import { useState } from 'react'

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
function TerminalSidebar() {
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
      <Component />
      <Div flexGrow={1} />
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

function Step1() {
  return (
    <>
      foo
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
