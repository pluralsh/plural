import { Layer } from 'grommet'
import { Banner } from 'pluralsh-design-system'
import { useCallback, useState } from 'react'

function Toast({ children, ...banner }) {
  const [open, setOpen] = useState(true)
  const close = useCallback(() => setOpen(false), [setOpen])

  if (!open) return null

  return (
    <Layer
      position="bottom-right"
      plain
      onEsc={close}
      onClickOutside={close}
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

export function SuccessToast({ children, ...banner }) {
  return (
    <Toast
      severity="success"
      {...banner}
    >{children}
    </Toast>
  )
}

