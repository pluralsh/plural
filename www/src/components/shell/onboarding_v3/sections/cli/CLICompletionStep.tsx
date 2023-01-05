import { A, Flex, P } from 'honorable'
import { Button, Checkbox, Codeline } from '@pluralsh/design-system'
import { useState } from 'react'

function CliCompletion({ onBack }) {
  const [completed, setCompleted] = useState(false)

  return (
    <>
      <P>Now that you've installed the Plural CLI, here are the next steps:</P>
      <Flex
        direction="column"
        gap="medium"
        marginVertical="large"
      >
        <Codeline>plural init</Codeline>
        <Codeline>plural bundle install &lt;app-name&gt; &lt;bundle-name&gt;</Codeline>
        <Codeline>plural build</Codeline>
        <Codeline>plural deploy --commit "first commit"</Codeline>
      </Flex>
      <P>
        If you need help filling out the install wizard during any of these steps,
        visit our{' '}
        <A
          inline
          href="https://docs.plural.sh/getting-started/getting-started"
          target="_blank"
          rel="noopener noreferrer"
        >
          Quickstart Guide
        </A>
        {' '}for more information.
      </P>
      <Checkbox
        marginTop="large"
        padding={0}
        checked={completed}
        onChange={({ target: { checked } }) => setCompleted(checked)}
      >I've completed all the steps above. *
      </Checkbox>
      <Flex
        gap="medium"
        justify="space-between"
        borderTop="1px solid border"
        paddingTop="large"
        marginTop="xlarge"
      >
        <Button
          secondary
          onClick={onBack}
        >Back
        </Button>
        <Button
          disabled={!completed}
          onClick={() => {
          }}
        >Continue to app
        </Button>
      </Flex>
    </>
  )
}

export default CliCompletion
