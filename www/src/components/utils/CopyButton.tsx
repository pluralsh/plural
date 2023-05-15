import { Ref, forwardRef, useCallback, useEffect, useState } from 'react'
import { CheckIcon, CopyIcon, IconFrame } from '@pluralsh/design-system'

type CopyButtonProps = {
  text?: string
  type?: 'secondary' | 'tertiary' | 'floating'
}

function CopyButtonRef(
  { text, type = 'floating' }: CopyButtonProps,
  ref: Ref<any>
) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 1000)

      return () => clearTimeout(timeout)
    }
  }, [copied])

  const handleCopy = useCallback(
    () =>
      window.navigator.clipboard
        .writeText(text ?? '')
        .then(() => setCopied(true)),
    [text]
  )

  return (
    <IconFrame
      clickable
      icon={copied ? <CheckIcon /> : <CopyIcon />}
      onClick={() => handleCopy()}
      ref={ref}
      textValue={text}
      tooltip
      type={type}
    />
  )
}

const CopyButton = forwardRef(CopyButtonRef)

export default CopyButton
