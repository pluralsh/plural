import { Callout } from '@pluralsh/design-system'
import { ComponentProps } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

function logError(error: Error, info: { componentStack: string }) {
  // Do something with the error, e.g. log to an external API
  console.error('Error:', error)
  console.error(`Component stack:\n${info.componentStack}`)
}

function ErrorFallback({ error }: any) {
  return (
    <Callout
      severity="danger"
      title="Sorry, something went wrong"
    >
      {error.message}
    </Callout>
  )
}

export function PluralErrorBoundary(
  props: Partial<ComponentProps<typeof ErrorBoundary>>
) {
  return (
    <ErrorBoundary
      // @ts-ignore
      onError={logError}
      {...props}
      {...(!props.fallbackRender &&
      !props.fallback &&
      !props.FallbackComponent &&
      import.meta.env.MODE === 'development'
        ? { FallbackComponent: ErrorFallback }
        : {})}
    />
  )
}
