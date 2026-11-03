import {
  Button,
  type ButtonProps,
  CheckIcon,
  Flex,
  usePrevious,
} from '@pluralsh/design-system'
import { ReactNode, useEffect, useState } from 'react'
import { useTheme } from 'styled-components'

export type SaveButtonProps = ButtonProps & {
  dirty?: boolean
  loading?: boolean
  error?: boolean
  label?: ReactNode
  position?: 'right' | 'left'
}

export default function SaveButton({
  dirty,
  error,
  loading,
  label = 'Save',
  position = 'right',
  ...props
}: SaveButtonProps) {
  const [showSaved, setShowSaved] = useState(false)
  const theme = useTheme()
  const previousLoading = usePrevious(loading)

  useEffect(() => {
    if (!loading && previousLoading && !error) {
      setShowSaved(true)
      const timeout = setTimeout(() => {
        setShowSaved(false)
      }, 2000)

      return () => {
        setShowSaved(false)
        clearTimeout(timeout)
      }
    }
    // If previousLoading is included in deps, showSave will immediately flip back
    // to false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error])

  return (
    <Flex direction={position === 'left' ? 'row' : 'row-reverse'}>
      <Button
        type="submit"
        loading={loading}
        disabled={!dirty}
        {...props}
      >
        {label}
      </Button>
      {(dirty || showSaved) && (
        <Flex
          marginRight={position === 'right' ? 'medium' : 0}
          marginLeft={position === 'left' ? 'medium' : 0}
          align="center"
          color={theme.colors['text-xlight']}
          css={{ ...theme.partials.text.body2 }}
        >
          {dirty ? (
            <>Unsaved changes</>
          ) : (
            <>
              Saved{' '}
              <CheckIcon
                size={12}
                marginLeft={theme.spacing.xsmall}
                color={theme.colors['text-xlight']}
              />
            </>
          )}
        </Flex>
      )}
    </Flex>
  )
}
