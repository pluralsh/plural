import {
  A, Button, Div, Flex, Span,
} from 'honorable'
import {
  Checklist, ChecklistItem, ChecklistStateProps, DownloadIcon, GitHubLogoIcon, MarketIcon, SourcererIcon, TerminalIcon,
} from 'pluralsh-design-system'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function GettingStarted() {
  const navigate = useNavigate()

  const [selected, setSelected] = useState<number>(0)
  const [focused, setFocused] = useState<number>(-1)
  const [completed, setCompleted] = useState<number>(-1)
  const [open, setOpen] = useState<boolean>(true)
  const [dismiss, setDismiss] = useState(false)
  const checklistStateProps: ChecklistStateProps = {
    onSelectionChange: setSelected,
    onFocusChange: setFocused,
    onOpenChange: setOpen,
    selectedKey: selected,
    focusedKey: focused,
    completedKey: completed,
    isOpen: open,
    isDismissed: dismiss,
  }

  const isCompleted = useCallback(() => completed >= selected, [completed, selected])
  const canComplete = useCallback(() => Math.abs(selected - completed) === 1, [selected, completed])

  const completeButton = (
    <Button
      small
      onClick={() => {
        setCompleted(selected)
        setSelected(selected + 1)
        setFocused(selected + 1)
      }}
      disabled={isCompleted() || !canComplete()}
    >Mark as done
    </Button>
  )

  return (
    <Flex
      grow={1}
      justify="center"
      style={{
        bottom: 0,
        position: 'fixed',
        zIndex: 999,
      }}
    >
      <Checklist
        label="Getting Started"
        stateProps={checklistStateProps}
        footerChildren={(
          <Flex
            gap="small"
          >
            <Button
              as="a"
              href="https://discord.gg/pluralsh"
              target="_blank"
              rel="noopener noreferrer"
              secondary
              small
            >Support
            </Button>

            <Button
              as="a"
              href="https://docs.plural.sh/"
              target="_blank"
              rel="noopener noreferrer"
              secondary
              small
            >Docs
            </Button>

            <Button
              as="a"
              href="https://github.com/pluralsh/plural"
              target="_blank"
              rel="noopener noreferrer"
              secondary
              small
            >GitHub
            </Button>

            <Flex flex="1" />

            <Button
              small
              tertiary
              padding="none"
              onClick={() => setDismiss(true)}
            >Dismiss
            </Button>
          </Flex>
        )}
        completeChildren={(
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
        )}
      >
        <ChecklistItem title="Setup on your own cloud">
          <Flex
            direction="column"
            gap="medium"
          >
            <Span>
              If you'd prefer to use Plural on your local machine, get started with the&nbsp;
              <A
                inline
                href="https://docs.plural.sh/getting-started/getting-started"
                target="_blank"
                rel="noopener noreferrer"
              >Plural CLI
              </A>.
            </Span>
            <Flex gap="small">
              <Button
                small
                secondary
                startIcon={<TerminalIcon />}
                onClick={() => {
                  setOpen(false)
                  navigate('/shell')
                }}
              >Launch Cloud Shell
              </Button>
              {completeButton}
            </Flex>
          </Flex>
        </ChecklistItem>

        <ChecklistItem title="Install Plural Console">
          <Flex
            direction="column"
            gap="medium"
          >
            This will enable out-of-the-box monitoring, scaling, and security for all your applications.
            <Flex gap="small">
              <Button
                small
                secondary
                startIcon={<DownloadIcon />}
                onClick={() => {
                  setOpen(false)
                  navigate('repository/a051a0bf-61b5-4ab5-813d-2c541c83a979')
                }}
              >Install
              </Button>
              {completeButton}
            </Flex>
          </Flex>
        </ChecklistItem>
        <ChecklistItem title="Install another app">
          <Flex
            gap="small"
          >
            <Button
              small
              secondary
              startIcon={<MarketIcon />}
              onClick={() => {
                setOpen(false)
                navigate('/marketplace')
              }}
            >View marketplace
            </Button>
            {completeButton}
          </Flex>
        </ChecklistItem>
      </Checklist>
    </Flex>
  )
}
