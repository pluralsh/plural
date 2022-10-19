import {
  A, Button, Flex, Span,
} from 'honorable'
import {
  Checklist, ChecklistItem, ChecklistStateProps, DownloadIcon, MarketIcon, TerminalIcon,
} from 'pluralsh-design-system'
import { useCallback, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CurrentUserContext } from '../../../login/CurrentUser'

import { ChecklistComplete } from './Complete'

import { ChecklistFooter } from './Footer'

export function OnboardingChecklist() {
  const navigate = useNavigate()
  const user = useContext(CurrentUserContext)

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

  console.log(user)

  return (
    <Flex
      grow={1}
      justify="center"
      style={{
        bottom: 0,
        position: 'fixed',
        zIndex: 1,
      }}
    >
      <Checklist
        label="Getting Started"
        stateProps={checklistStateProps}
        footerChildren={<ChecklistFooter setDismiss={setDismiss} />}
        completeChildren={(
          <ChecklistComplete
            setDismiss={setDismiss}
            setCompleted={setCompleted}
            setSelected={setSelected}
          />
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
