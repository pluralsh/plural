import {
  ArrowTopRightIcon,
  Button,
  Callout,
  Codeline,
  Flex,
  WrapWithIf,
} from '@pluralsh/design-system'
import styled, { useTheme } from 'styled-components'

import { sanitizeConsoleUrl } from 'components/overview/clusters/all/AllClustersTableCols'
import { useCreateClusterContext } from '../CreateClusterWizard'

export function AuthenticationStep() {
  const theme = useTheme()
  const { consoleUrl, isCreatingInstance } = useCreateClusterContext()

  return (
    <div css={{ position: 'relative' }}>
      {isCreatingInstance && (
        <Callout
          title="This step requires the Plural Console"
          severity="warning"
          css={{
            position: 'absolute',
            zIndex: 1,
            background: theme.colors['fill-one'],
            boxShadow: theme.boxShadows.slight,
          }}
        >
          Your Console is still being created. Please wait until it's ready
          before proceeding.
        </Callout>
      )}
      <WrapWithIf
        condition={isCreatingInstance}
        wrapper={<BlurredContentSC />}
      >
        <Flex
          gap="large"
          direction="column"
        >
          <span>You're almost done — just one last step!</span>
          <span>
            Now that `plural up` has completed you will have access to your
            Plural Console. You must generate an access token there and run it
            on your local machine to authenticate the new cloud instance.
          </span>
          <Flex direction="column">
            <span>
              1. Go to your newly deployed Console. The link is in the Clusters
              Tab.
            </span>
            <Button
              as="a"
              href={sanitizeConsoleUrl(consoleUrl)}
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
        </Flex>
      </WrapWithIf>
    </div>
  )
}

const BlurredContentSC = styled.div`
  filter: blur(4px);
  pointer-events: none;
  user-select: none;
`
