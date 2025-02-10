import { Ref, forwardRef, useCallback, useEffect, useState } from 'react'
import { CheckIcon, CopyIcon, IconFrame } from '@pluralsh/design-system'
import { useCopy } from 'hooks/useCopy'

type CopyButtonProps = {
  text?: string
  type?: 'secondary' | 'tertiary' | 'floating'
}

function CopyButtonRef(
  { text, type = 'floating' }: CopyButtonProps,
  ref: Ref<any>
) {
  const { copied, handleCopy } = useCopy(text)

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
