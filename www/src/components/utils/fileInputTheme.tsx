import { CloseIcon } from '@pluralsh/design-system'

export const fileInputTheme = ({
  selected = false,
  error = false,
  theme,
}: {
  selected?: boolean
  error?: boolean
  theme: any
}) => ({
  fileInput: {
    message: {
      size: 'small',
    },
    hover: {
      border: {
        color: error
          ? theme.colors['border-error']
          : selected
          ? theme.colors['border-success']
          : theme.colors['border-input'],
      },
      background: {
        color: theme.colors['fill-one-hover'],
        opacity: 1,
      },
    },
    dragOver: {
      border: {
        color: theme.colors['border-outline-focused'],
      },
      background: {
        color: theme.colors['fill-one-hover'],
        opacity: 1,
      },
    },
    background: {
      color: theme.colors['fill-one'],
      opacity: 1,
    },
    round: {
      size: `${theme.borderRadiuses.medium}px`,
    },
    border: {
      size: `${theme.borderWidths.default}px`,
      opacity: false,
      color: error
        ? theme.colors['border-error']
        : selected
        ? theme.colors['border-success']
        : theme.colors['border-input'],
    },
    icons: {
      remove: CloseIcon,
    },
  },
})
