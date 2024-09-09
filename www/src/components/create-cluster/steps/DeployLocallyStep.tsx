import { Callout, Checkbox, Codeline, Flex } from '@pluralsh/design-system'
import { CSSProp, useTheme } from 'styled-components'

import { useCreateClusterContext } from '../CreateClusterWizard'

export function DeployLocallyStep() {
  const theme = useTheme()
  const { finishEnabled, setFinishEnabled } = useCreateClusterContext()

  return (
    <Flex
      direction="column"
      gap="xlarge"
    >
      <Callout title="This command may take 30 or more minutes to complete">
        We recommend keeping this tab open and proceeding once your control
        plane is deployed.
      </Callout>
      <Flex
        direction="column"
        gap="small"
      >
        <span css={theme.partials.text.body2}>
          Now that you've installed the Plural CLI, all that's needed is to run
          one command. This will provide everything you need to run your control
          plane.
        </span>
        <Codeline css={{ background: theme.colors['fill-two'] }}>
          plural up
        </Codeline>
        <span css={theme.partials.text.body2}>
          For a full guide on properly deploying your cloud instance and cluster
          with `plural up`,{' '}
          <a
            css={theme.partials.text.inlineLink}
            href="https://docs.plural.sh/"
            target="_blank"
            rel="noreferrer"
          >
            visit our documentation.
          </a>
        </span>
      </Flex>
      <Checkbox
        small
        checked={finishEnabled}
        onChange={(e) => setFinishEnabled(e.target.checked)}
        css={
          {
            '& .label': {
              userSelect: 'none',
            },
          } as CSSProp
        }
      >
        The `plural up` command has finished running.
        <span css={{ color: theme.colors['text-danger'] }}>*</span>
      </Checkbox>
    </Flex>
  )
}
