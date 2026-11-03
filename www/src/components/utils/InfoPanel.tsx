import { CloseIcon, Flex, IconFrame, Modal } from '@pluralsh/design-system'
import { ReactNode } from 'react'
import styled from 'styled-components'

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
      <HeaderSC>
        <Flex
          align="center"
          justify="space-between"
        >
          <TitleSC>{title}</TitleSC>
          <IconFrame
            clickable
            icon={<CloseIcon />}
            onClick={(_) => onClose()}
          />
        </Flex>
      </HeaderSC>
      <Flex
        direction="column"
        overflowY="auto"
        height={contentHeight}
        css={{ gap: contentGap, padding: contentPadding }}
      >
        {children}
      </Flex>
    </Modal>
  )
}

const HeaderSC = styled.div(({ theme }) => ({
  borderBottom: `1px solid ${theme.colors['border-fill-two']}`,
}))

const TitleSC = styled.span({
  fontSize: 18,
  fontWeight: 500,
  lineHeight: '24px',
})
