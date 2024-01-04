import { MouseEventHandler } from 'react'
import styled from 'styled-components'
import { styledThemeDark, styledThemeLight } from '@pluralsh/design-system'

type IconUploadPreviewProps = {
  src: string | null
  onClick: MouseEventHandler
  mode: 'dark' | 'light'
}

const IconUploadPreviewSC = styled.div<{
  $mode?: 'dark' | 'light'
}>(({ theme, $mode }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 96,
  height: 96,
  padding: theme.spacing.small,
  border: theme.borders['fill-two'],
  borderRadius: theme.borderRadiuses.medium,
  cursor: 'pointer',
  backgroundColor:
    $mode === 'light'
      ? styledThemeLight.colors['fill-zero']
      : styledThemeDark.colors['fill-zero'],
  '&:hover': {
    backgroundColor:
      $mode === 'light'
        ? styledThemeLight.colors['fill-two-hover']
        : styledThemeDark.colors['fill-two-hover'],
  },
  p: {
    ...theme.partials.text.title2,
    color:
      $mode === 'light'
        ? styledThemeLight.colors['text-light']
        : styledThemeDark.colors['text-light'],
  },
  img: {
    width: '100%',
    objectFit: 'cover',
  },
}))

function IconUploadPreview({
  src = null,
  mode,
  onClick,
}: IconUploadPreviewProps) {
  return (
    <IconUploadPreviewSC
      $mode={mode}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt="Icon"
        />
      ) : (
        <p>+</p>
      )}
    </IconUploadPreviewSC>
  )
}

export default IconUploadPreview
