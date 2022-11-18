import {
  Ref,
  forwardRef,
  useEffect,
  useState,
} from 'react'
import { Button, ButtonProps } from 'honorable'

import { Tooltip } from '@pluralsh/design-system'

type CopyableButtonProps = ButtonProps & {
displayText?: string
}

function CopyableButtonRef({ copyText, onClick, ...props }: CopyableButtonProps, ref: Ref<any>) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 1000)

      return () => clearTimeout(timeout)
    }
  }, [copied])

  const handleCopy = () => window.navigator.clipboard.writeText(copyText).then(() => setCopied(true))

  return (
    <Tooltip
      label="Copied!"
      strategy="fixed"
      placement="top"
      displayOn="manual"
      dismissable
      onOpenChange={open => {
        if (!open && copied) setCopied(false)
      }}
      zIndex={1000}
      manualOpen={copied}
    >
      <Button
        ref={ref}
        border="1px solid border-input"
        borderRadius="medium"
        onClick={(...args) => {
          if (onClick) onClick(...args)
          handleCopy()
        }}
        {...props}
      />
    </Tooltip>
  )
}

const CopyableButton = forwardRef(CopyableButtonRef)

export default CopyableButton

