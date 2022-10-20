import { useMutation, useQuery } from '@apollo/client'
import { A, Flex, Span } from 'honorable'
import {
  Button, Checklist, ChecklistItem, ChecklistStateProps, DownloadIcon, MarketIcon, TerminalIcon, Toast,
} from 'pluralsh-design-system'
import {
  useCallback, useEffect, useRef, useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { OnboardingChecklistState, OnboardingState, User } from '../../../../generated/graphql'
import { ONBOARDING_STATUS, UPDATE_ONBOARDING_CHECKLIST } from '../../../users/queries'

import { ChecklistComplete } from './Complete'
import { ChecklistFooter } from './Footer'

const CHECKLIST_ORDER = [
  OnboardingChecklistState.New, OnboardingChecklistState.Configured, OnboardingChecklistState.ConsoleInstalled, OnboardingChecklistState.Finished,
]

function statusToIndex(status: OnboardingChecklistState) : number {
  return CHECKLIST_ORDER.indexOf(status)
}

export function OnboardingChecklist() {
  const navigate = useNavigate()

  // State
  const [status, setStatus] = useState<OnboardingChecklistState>(OnboardingChecklistState.New)
  const [completed, setCompleted] = useState<number>(-1)
  const [selected, setSelected] = useState<number>(0)
  const [focused, setFocused] = useState<number>(-1)
  const [open, setOpen] = useState<boolean>(true)
  const [dismiss, setDismiss] = useState(false)
  const [visible, setVisible] = useState(false)

  // GraphQL
  const { data, loading: statusLoading, refetch } = useQuery<{me: User}>(ONBOARDING_STATUS, { pollInterval: 60000 })
  const [updateChecklist, { loading: checklistUpdating, error }] = useMutation(UPDATE_ONBOARDING_CHECKLIST)
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

  // Callbacks
  const nextStatus = useCallback((status: OnboardingChecklistState) => (status === OnboardingChecklistState.Finished ? status : CHECKLIST_ORDER[CHECKLIST_ORDER.indexOf(status) + 1]), [])
  const isCompleted = useCallback(() => completed >= selected, [completed, selected])
  const canComplete = useCallback(() => Math.abs(selected - completed) === 1, [selected, completed])

  useEffect(() => {
    if (!data) return

    const { me: user } = data
    const status = user?.onboardingChecklist?.status || OnboardingChecklistState.New
    const completed = statusToIndex(status) - 1
    const selected = completed > -1 ? completed + 1 : 0
    const dismissed = user?.onboardingChecklist?.dismissed || (user?.onboarding === OnboardingState.New) || false

    setCompleted(completed)
    setSelected(selected)
    setStatus(status)
    setDismiss(dismissed)
  }, [setCompleted, setSelected, setStatus, setDismiss, data])

  // This is a small workaround to not show the checklist closing animation
  // on every page refresh to the users that already finished it and still be able to
  // see dismiss animation.
  useEffect(() => {
    if (data) {
      setTimeout(() => setVisible(true), 1000)
    }
  }, [data])

  const completeButton = (
    <Button
      small
      loading={statusLoading || checklistUpdating}
      onClick={() => updateChecklist({
        variables: {
          attributes: {
            onboardingChecklist: {
              status: nextStatus(status),
            },
          },
        },
        onCompleted: refetch,
      })}
      disabled={isCompleted() || !canComplete()}
    >Mark as done
    </Button>
  )

  if (!visible) {
    return
  }

  return (
    <Flex
      grow={1}
      justify="center"
      style={{
        bottom: 0,
        position: 'fixed',
        zIndex: 10,
      }}
    >
      {error && (
        <Toast
          severity="error"
          marginBottom="medium"
          marginRight="xxxxlarge"
        >
          <span>{error?.message}</span>
        </Toast>
      )}
      <Checklist
        label="Getting Started"
        stateProps={checklistStateProps}
        footerChildren={<ChecklistFooter refetch={refetch} />}
        completeChildren={<ChecklistComplete refetch={refetch} />}
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
