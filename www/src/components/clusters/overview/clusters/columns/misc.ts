import styled from 'styled-components'
import { createColumnHelper } from '@tanstack/react-table'

import { ClusterListElement } from '../types'

export const columnHelper = createColumnHelper<ClusterListElement>()

export const CellWrap = styled.div(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  gap: theme.spacing.small,
}))

export const CellCaption = styled.div(({ theme }) => ({
  ...theme.partials.text.caption,
  color: theme.colors['text-xlight'],
}))
