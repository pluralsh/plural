import { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Button, Codeline, Modal } from '@pluralsh/design-system'

const LAUNCH_APP_MODAL_INFO_LOCAL_STORAGE_KEY = 'plural-shell-launch-app-modal'

function useLaunchAppModal() {
  const shown =
    localStorage.getItem(LAUNCH_APP_MODAL_INFO_LOCAL_STORAGE_KEY) === 'true'
  const markAsShown = useCallback(
    () => localStorage.setItem(LAUNCH_APP_MODAL_INFO_LOCAL_STORAGE_KEY, 'true'),
    []
  )

  return {
    shown,
    markAsShown,
  }
}

const ModalActions = styled(ModalActionsUnstyled)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing.medium,
}))

function ModalActionsUnstyled({ onCloseClick, domain, ...props }): JSX.Element {
  return (
    <div {...props}>
      <Button
        secondary
        onClick={onCloseClick}
      >
        Close
      </Button>
      <Button
        onClick={onCloseClick}
        {...{
          as: 'a',
          href: `https://${domain}`,
          target: '_blank',
          rel: 'noopener noreferer',
        }}
      >
        Continue to app
      </Button>
    </div>
  )
}

const ModalContent = styled(ModalContentUnstyled)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.large,
  ...theme.partials.text.body1,
}))

function ModalContentUnstyled({ name, ...props }): JSX.Element {
  const command = useMemo(() => `plural watch ${name}`, [name])

  return (
    <div {...props}>
      <span>
        Kubernetes can take a minute to fully provision a newly installed
        application. If an application is unreachable check back in a few
        minutes.
      </span>
      <span>
        You can track the status of your applications using the following
        command in the cloudshell:
      </span>
      <Codeline>{command}</Codeline>
    </div>
  )
}

function LaunchAppModal({ name, domain, setVisible }): JSX.Element {
  const { markAsShown } = useLaunchAppModal()

  return (
    <Modal
      open
      portal
      header="Access information"
      style={{ padding: 0 }}
      actions={
        <ModalActions
          onCloseClick={() => {
            setVisible(false)
            markAsShown()
          }}
          domain={domain}
        />
      }
    >
      <ModalContent name={name} />
    </Modal>
  )
}

export { LaunchAppModal, useLaunchAppModal }
