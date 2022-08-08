import { Layer } from 'grommet'
import { Banner } from 'pluralsh-design-system'
import { useCallback, useEffect, useState } from 'react'

function Toast({ children, onClose = () => {}, ...banner }) {
  const closeTimeout = 5000
  const [open, setOpen] = useState(true)
  const close = useCallback(() => {
    setOpen(false)
    onClose()
  }, [setOpen, onClose])

  useEffect(() => {
    if (open) {
      setTimeout(() => close(), closeTimeout)
    }
  }, [open, close, closeTimeout])

  if (!open) return null

  return (
    <Layer
      position="bottom-right"
      marginRight="large"
      marginBottom="large"
      plain
      modal={false}
    >
      <Banner
        {...banner}
        marginBottom="20px"
        marginRight="100px"
        onClose={close}
      >
        {children}
      </Banner>
    </Layer>
  )
}

export function GraphQlToast({ header, error }) {
  return <ErrorToast>{header}: {error.graphQLErrors[0].message}</ErrorToast>
}

export function ErrorToast({ children, ...banner }) {
  return (
    <Toast
      severity="error"
      {...banner}
    >{children}
    </Toast>
  )
}

export function SuccessToast({ children, onClose = () => {}, ...banner }) {
  return (
    <Toast
      severity="success"
      onClose={onClose}
      {...banner}
    >{children}
    </Toast>
  )
}

