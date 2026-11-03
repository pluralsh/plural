import { ReactNode } from 'react'
import styled from 'styled-components'

export const FINISHED_CONSOLE_INSTANCE_KEY = 'plural-finished-console-instance'
export const FINISHED_LOCAL_CREATE_KEY = 'plural-finished-local-create'

export function CreateClusterActions({
  start,
  children,
}: {
  start?: ReactNode
  children?: ReactNode
}) {
  return (
    <ActionsSC>
      <div>{start}</div>
      <div className="end">{children}</div>
    </ActionsSC>
  )
}

const ActionsSC = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing.medium,
  marginTop: 'auto',
  padding: `${theme.spacing.small} 0 ${theme.spacing.xlarge}`,
  '.end': { display: 'flex', gap: theme.spacing.small },
}))
