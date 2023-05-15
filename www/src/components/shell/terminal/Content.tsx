import { useMutation, useQuery } from '@apollo/client'
import { A, Div, Flex, Span } from 'honorable'
import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react'
import { Button, ErrorIcon, Modal } from '@pluralsh/design-system'
import IsEmpty from 'lodash/isEmpty'

import useOnboarded from '../hooks/useOnboarded'
import OnboardingHeader from '../onboarding/OnboardingHeader'
import { CLOUD_SHELL_QUERY, SETUP_SHELL_MUTATION } from '../queries'
import { RootMutationType } from '../../../generated/graphql'

import LoadingIndicator from '../../utils/LoadingIndicator'

import TerminalThemeProvider from './actionbar/theme/Provider'
import Terminal from './Terminal'
import ContentCard from './ContentCard'
import { ContextProps, State, TerminalContext } from './context/terminal'
import { SHELL_CONFIGURATION_QUERY } from './queries'
import { NextStepsModal } from './NextSteps'
import { Sidebar } from './sidebar/Sidebar'

function WelcomeModal() {
  const [open, setOpen] = useState(true)

  return (
    <Modal
      open={open}
      style={{ padding: 0 }}
    >
      <Flex
        direction="column"
        gap="large"
      >
        <Span>Welcome to Plural!</Span>
        <Span>
          Completing the install wizard will deploy your applications and give
          you access to your Plural Console.
        </Span>
        <Button
          data-phid="start-install-cta"
          onClick={() => setOpen(false)}
        >
          Start Install
        </Button>
      </Flex>
    </Modal>
  )
}

function MissingPermissionsModal({ refetch, missing }): JSX.Element {
  const [open, setOpen] = useState(true)
  const [loading, setLoading] = useState(false)

  const rerun = useCallback(() => {
    setLoading(true)
    refetch().finally(() => setLoading(false))
  }, [refetch])

  return (
    <Modal
      open={open}
      style={{ padding: 0 }}
      onClose={() => setOpen(false)}
      header={
        <Flex gap="small">
          <ErrorIcon color="icon-error" />
          <Span lineHeight="normal">cloud credentials error</Span>
        </Flex>
      }
      actions={
        <Flex gap="medium">
          <Button
            secondary
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => rerun()}
            loading={loading}
          >
            Rerun permission check
          </Button>
        </Flex>
      }
    >
      <Flex
        direction="column"
        gap="large"
      >
        <Span>
          We’ve detected you’re missing the following required credentials for
          your cloud account: <b>{missing.join(', ')}</b>.
        </Span>
        <Span>
          Please update your credentials in your cloud account and try
          again.&nbsp;
          <A
            inline
            href="https://docs.plural.sh/getting-started/cloud-shell-quickstart#set-up-a-cloud-provider"
            target="_blank"
          >
            Learn more
          </A>
        </Span>
      </Flex>
    </Modal>
  )
}

function Content() {
  const { fresh: isOnboarding } = useOnboarded()
  const [state, setState] = useState(State.New)
  const [onAction, setOnAction] = useState<Dispatch<string>>()

  const { data: { shell } = { shell: undefined } } = useQuery(
    CLOUD_SHELL_QUERY,
    { fetchPolicy: 'network-only' }
  )
  const {
    data: { shellConfiguration } = { shellConfiguration: undefined },
    stopPolling,
    refetch,
  } = useQuery(SHELL_CONFIGURATION_QUERY, { skip: !shell, pollInterval: 5000 })
  const [
    setupShell,
    { data: { setupShell: setupShellData } = {} as RootMutationType },
  ] = useMutation(SETUP_SHELL_MUTATION, { fetchPolicy: 'no-cache' })

  const context: ContextProps = useMemo(
    () => ({
      shell,
      configuration: shellConfiguration,
      state,
      setState,
      onAction,
      setOnAction,
    }),
    [onAction, shell, shellConfiguration, state]
  )

  useEffect(() => {
    if (shellConfiguration) stopPolling()
  }, [shellConfiguration, stopPolling])

  useEffect(() => {
    setupShell()
  }, [setupShell])

  if (!shell?.provider) return <LoadingIndicator />

  return (
    <Div height={isOnboarding ? '100%' : 'calc(100% - 48px)'}>
      {isOnboarding && (
        <>
          <OnboardingHeader mode="shell" />
          <WelcomeModal />
        </>
      )}

      {!IsEmpty(setupShellData?.missing) && (
        <MissingPermissionsModal
          refetch={setupShell}
          missing={setupShellData.missing}
        />
      )}

      <Flex
        flexGrow={1}
        height={isOnboarding ? 'calc(100% - 56px)' : '100%'}
        padding="large"
      >
        <ContentCard>
          <TerminalContext.Provider value={context}>
            <Sidebar refetch={refetch} />
            <TerminalThemeProvider>
              <Terminal provider={shell.provider} />
            </TerminalThemeProvider>
            <NextStepsModal />
          </TerminalContext.Provider>
        </ContentCard>
      </Flex>
    </Div>
  )
}

export default Content
