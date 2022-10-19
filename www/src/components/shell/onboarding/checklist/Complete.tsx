import {
  A, Button, Div, Flex, Span,
} from 'honorable'
import { GitHubLogoIcon, SourcererIcon } from 'pluralsh-design-system'

export function ChecklistComplete({ setCompleted, setSelected, setDismiss }) {
  return (
    <Flex
      direction="column"
      gap="medium"
    >
      <Flex
        paddingHorizontal="large"
        gap="medium"
      >
        <SourcererIcon />
        <Flex
          gap="xxsmall"
          direction="column"
        >
          <Span subtitle1>Congratulations!</Span>
          <Span body2>You're well on your way to becoming an
            <A
              inline
              href="https://www.plural.sh/community"
              target="_blank"
              rel="noopener noreferrer"
            >
              open-sourcerer
            </A>.
          </Span>
        </Flex>
      </Flex>
      <Div
        height={1}
        backgroundColor="border-input"
      />
      <Flex
        gap="small"
        paddingHorizontal="large"
      >
        <Button
          as="a"
          href="https://github.com/pluralsh/plural"
          target="_blank"
          rel="noopener noreferrer"
          small
          secondary
          startIcon={<GitHubLogoIcon />}
        >Star us on GitHub
        </Button>
        <Flex grow={1} />
        <Button
          small
          secondary
          onClick={() => {
            setCompleted(-1)
            setSelected(0)
          }}
        >Restart
        </Button>
        <Button
          small
          onClick={() => setDismiss(true)}
        >Complete
        </Button>
      </Flex>
    </Flex>
  )
}
