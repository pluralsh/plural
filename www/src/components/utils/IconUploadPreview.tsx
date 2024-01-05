import { MouseEventHandler } from 'react'
import styled from 'styled-components'
import { styledThemeDark, styledThemeLight } from '@pluralsh/design-system'

type IconUploadPreviewProps = {
  src: string | null
  onClick: MouseEventHandler
  mode?: 'dark' | 'light'
}

const IconUploadPreviewSC = styled.div<{
  $mode?: 'dark' | 'light'
}>(({ theme, $mode }) => {
  const colors =
    $mode === 'light'
      ? styledThemeLight.colors
      : $mode === 'dark'
      ? styledThemeDark.colors
      : theme.colors

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 96,
    height: 96,
    padding: theme.spacing.small,
    border: theme.borders['fill-two'],
    borderRadius: theme.borderRadiuses.medium,
    cursor: 'pointer',
    backgroundColor: colors['fill-zero'],
    '&:hover': {
      backgroundColor: colors['fill-two-hover'],
    },
    p: {
      ...theme.partials.text.title2,
      color: colors['text-light'],
    },
    img: {
      width: '100%',
      objectFit: 'cover',
    },
  }
})

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
