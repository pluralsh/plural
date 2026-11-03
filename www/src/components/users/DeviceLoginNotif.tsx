import { useEffect, useState } from 'react'
import { Modal } from '@pluralsh/design-system'

import { wipeDeviceToken } from './utils'

const LOGIN_KEY = 'dli-key'

// Device tokens are single-use; a leftover one would make the next signup or
// OAuth login fail when the backend can't activate it.
export const finishedDeviceLogin = () => {
  wipeDeviceToken()
  localStorage.setItem(LOGIN_KEY, 'true')
}

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
      size="custom"
      css={{ width: '512px' }}
    >
      The device you requested on should now have access.
    </Modal>
  )
}
