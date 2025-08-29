import { CSSProperties } from 'react'

export const TRUNCATE = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} satisfies CSSProperties

export const TRUNCATE_LEFT = {
  ...TRUNCATE,
  direction: 'rtl',
  textAlign: 'left',
} satisfies CSSProperties
