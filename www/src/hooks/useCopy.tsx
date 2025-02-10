import { useCallback, useEffect, useState } from 'react'

export function useCopy(text?: string, msgTimeout = 1000) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), msgTimeout)
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

  return { copied, handleCopy }
}
