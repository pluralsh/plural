import {
  ArrowTopRightIcon,
  Button,
  Checkbox,
  Codeline,
  Flex,
} from '@pluralsh/design-system'
import { CSSProp, useTheme } from 'styled-components'

import { useCreateClusterContext } from '../CreateClusterWizard'

export function AuthenticationStep() {
  const theme = useTheme()
  const { consoleUrl, finishEnabled, setFinishEnabled } =
    useCreateClusterContext()

  return (
    <Flex
      gap="large"
      direction="column"
    >
      <span>You're almost done — just one last step!</span>
      <span>
        Now that `plural up` has completed you will have access to your Plural
        Console. You must generate an access token there and run it on your
        local machine to authenticate the new cloud instance.
      </span>
      <Flex direction="column">
        <span>
          1. Go to your newly deployed Console. The link is in the Clusters Tab.
        </span>
        <Button
          as="a"
          href={`https://${consoleUrl}`}
          target="_blank"
          margin={`${theme.spacing.medium}px 0`}
          endIcon={<ArrowTopRightIcon />}
        >
          Go to Console
        </Button>
        <span>{'2. Navigate to Settings > Access Tokens'}</span>
        <span>3. Generate a new access token.</span>
        <span>
          4. Run the command below, locally, and enter the access token.
        </span>
      </Flex>
      <Codeline css={{ background: theme.colors['fill-two'] }}>
        plural up --cloud
      </Codeline>
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
        I successfully authenticated my cloud instance locally.
        <span css={{ color: theme.colors['text-danger'] }}>*</span>
      </Checkbox>
    </Flex>
  )
}
