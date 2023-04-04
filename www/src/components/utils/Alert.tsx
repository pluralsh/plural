import { Callout } from '@pluralsh/design-system'
import { GraphQLErrors } from '@apollo/client/errors'
import { ReactNode } from 'react'
import { CalloutProps, CalloutSeverity } from '@pluralsh/design-system/dist/components/Callout'

type Status = 'er' | 'su' | 'in'

export const AlertStatus = {
  ERROR: 'er',
  SUCCESS: 'su',
  INFO: 'in',
} satisfies Record<string, Status>

const StatusToSeverity: Record<Status, CalloutSeverity> = {
  er: 'danger',
  su: 'success',
  in: 'info',
}

export function GqlError({
  header,
  error,
  ...props
}: {
  error?: { graphQLErrors: GraphQLErrors }
} & Omit<AlertProps, 'status' | 'description'>) {
  return (
    <Alert
      status={AlertStatus.ERROR}
      header={header}
      description={error?.graphQLErrors[0].message}
      {...props}
    />
  )
}

export function ErrorMessage({
  header,
  message,
  ...props
}: { message: ReactNode } & Omit<AlertProps, 'status' | 'description'>) {
  return (
    <Alert
      status={AlertStatus.ERROR}
      header={header}
      description={message}
      {...props}
    />
  )
}

type AlertProps = {
  status?: Status
  header?: string
  description: ReactNode
} & Omit<CalloutProps, 'title' | 'children'>

export function Alert({
  status, header, description, ...props
}: AlertProps) {
  return (
    <Callout
      {...(header ? { title: header } : {})}
      severity={(status && StatusToSeverity[status]) || 'info'}
      {...props}
    >
      {description}
    </Callout>
  )
}
