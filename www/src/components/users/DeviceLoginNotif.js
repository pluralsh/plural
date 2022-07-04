import { useEffect, useState } from 'react'
import { Box, Layer, Text } from 'grommet'
import { Fingerprint } from 'forge-core'

import { ModalHeader } from '../ModalHeader'

const LOGIN_KEY = 'dli-key'

export const finishedDeviceLogin = () => localStorage.setItem(LOGIN_KEY, true)

export const deviceLoginCompleted = () => localStorage.getItem(LOGIN_KEY)

export const wipeDeviceLogin = () => localStorage.removeItem(LOGIN_KEY)

export function DeviceLoginNotif() {
  const [open, setOpen] = useState(!!deviceLoginCompleted())

  useEffect(() => {
    if (open) wipeDeviceLogin()
  }, [open])

  if (!open) return null

  return (
    <Layer
      modal
      onEsc={() => setOpen(false)}
      onClickOutside={() => setOpen(false)}
    >
      <Box width="30vw">
        <ModalHeader
          text="Device Login Successful"
          setOpen={setOpen}
        />
        <Box
          fill="horizontal"
          direction="row"
          align="center"
          justify="center"
          gap="small"
          pad="medium"
        >
          <Fingerprint size="15px" />
          <Text size="small">The device you requested on should now have access</Text>
        </Box>
      </Box>
    </Layer>
  )
}
