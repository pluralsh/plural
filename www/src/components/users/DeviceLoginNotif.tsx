import { useEffect, useState } from 'react'
import { Text } from 'grommet'
import { FingerPrintIcon, Modal } from 'pluralsh-design-system'

const LOGIN_KEY = 'dli-key'

export const finishedDeviceLogin = () => localStorage.setItem(LOGIN_KEY, 'true')

export const deviceLoginCompleted = () => localStorage.getItem(LOGIN_KEY)

export const wipeDeviceLogin = () => localStorage.removeItem(LOGIN_KEY)

export function DeviceLoginNotif() {
  const [open, setOpen] = useState(!!deviceLoginCompleted())

  useEffect(() => {
    if (open) wipeDeviceLogin()
  }, [open])

  if (!open) return null

  return (
    <Modal
      header="Device Login Successful"
      open={open}
      onClose={() => setOpen(false)}
      width="512px"
      portal
    >
      <Text size="small">The device you requested on should now have access.</Text>
    </Modal>
  )
}
