import { ApolloError } from '@apollo/client'
import { Callout, type CalloutProps } from '@pluralsh/design-system'
import { ReactNode } from 'react'

type CalloutSeverity = NonNullable<CalloutProps['severity']>

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
  error?: Pick<ApolloError, 'graphQLErrors'>
} & Omit<AlertProps, 'status' | 'description'>) {
  return (
    <Alert
      status={AlertStatus.ERROR}
      header={header}
      description={error?.graphQLErrors?.[0]?.message ?? 'Error'}
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

export function Alert({ status, header, description, ...props }: AlertProps) {
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
