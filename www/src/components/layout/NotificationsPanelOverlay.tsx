import { Dispatch, SetStateAction, useRef } from 'react'
import { Flex, P, useOutsideClick } from 'honorable'
import { CloseIcon } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

import { NotificationsPanel } from './WithNotifications'
import { useContentOverlay } from './Overlay'

export function NotificationsPanelOverlay({
  leftOffset,
  isOpen,
  setIsOpen,
}: {
  leftOffset: number
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}) {
  const theme = useTheme()
  const notificationsPanelRef = useRef<any>()

  useContentOverlay(isOpen)

  useOutsideClick(notificationsPanelRef, () => {
    setIsOpen(false)
  })

  if (!isOpen) {
    return null
  }

  return (
    <Flex
      position="fixed"
      top={0}
      bottom={0}
      left={leftOffset}
      right={0}
      align="flex-end"
      zIndex={theme.zIndexes.selectPopover - 1}
    >
      <Flex
        ref={notificationsPanelRef}
        direction="column"
        backgroundColor="fill-one"
        width={480}
        height={464}
        borderTop="1px solid border"
        borderRight="1px solid border"
        borderTopRightRadius={6}
      >
        <Flex
          align="center"
          justify="space-between"
          padding="medium"
          borderBottom="1px solid border"
        >
          <P subtitle2>Notifications</P>
          <Flex
            align="center"
            justify="center"
            padding="xsmall"
            cursor="pointer"
            _hover={{
              backgroundColor: 'fill-one-hover',
            }}
            borderRadius="medium"
            onClick={() => setIsOpen(false)}
          >
            <CloseIcon />
          </Flex>
        </Flex>
        <Flex
          flexGrow={1}
          direction="column"
          overflowY="auto"
        >
          <NotificationsPanel closePanel={() => setIsOpen(false)} />
        </Flex>
      </Flex>
    </Flex>
  )
}
