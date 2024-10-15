import { CloseIcon, IconFrame, Modal } from '@pluralsh/design-system'
import { Div, Flex, Span } from 'honorable'
import { ReactNode } from 'react'

type InfoPanelProps = {
  title: string
  onClose?: () => void
  contentHeight?: number | string
  contentPadding?: number | string
  contentGap?: number | string
  children: ReactNode
}

export function InfoPanel({
  title,
  onClose = () => {},
  contentHeight = 300,
  contentPadding = 0,
  contentGap = 0,
  children,
}: InfoPanelProps) {
  return (
    <Modal
      open
      onOpenChange={onClose}
    >
      <Div borderBottom="1px solid border-fill-two">
        <Flex
          align="center"
          justify="space-between"
        >
          <Span
            fontSize={18}
            fontWeight={500}
            lineHeight="24px"
          >
            {title}
          </Span>
          <IconFrame
            clickable
            icon={<CloseIcon />}
            onClick={(_) => onClose()}
          />
        </Flex>
      </Div>
      <Flex
        direction="column"
        overflowY="auto"
        gap={contentGap}
        padding={contentPadding}
        height={contentHeight}
      >
        {children}
      </Flex>
    </Modal>
  )
}
