import { useEffect, useState } from 'react'
import { Button, type ButtonProps, Tooltip } from '@pluralsh/design-system'
import styled from 'styled-components'

type CopyableButtonProps = ButtonProps & {
  copyText?: string
}

export default function CopyableButton({
  copyText,
  onClick,
  ...props
}: CopyableButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 1000)

      return () => clearTimeout(timeout)
    }
  }, [copied])

  const handleCopy = () =>
    window.navigator.clipboard
      .writeText(copyText ?? '')
      .then(() => setCopied(true))

  return (
    <Tooltip
      label="Copied!"
      strategy="fixed"
      placement="top"
      displayOn="manual"
      dismissable
      onOpenChange={(open) => {
        if (!open && copied) setCopied(false)
      }}
      style={{ zIndex: 1000 }}
      manualOpen={copied}
    >
      <CopyableButtonSC
        onClick={(e) => {
          onClick?.(e)
          handleCopy()
        }}
        {...props}
      />
    </Tooltip>
  )
}

const CopyableButtonSC = styled(Button)(({ theme }) => ({
  border: `1px solid ${theme.colors['border-input']}`,
  borderRadius: theme.borderRadiuses.medium,
}))
