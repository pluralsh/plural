import { blue } from 'pluralsh-design-system/dist/theme'
import styled from 'styled-components'

type Hue = 'none' | 'default' | 'lighter' | 'lightest'

const UListBare = styled.ul(({ ...props }) => ({
  margin: 0,
  padding: 0,
  backgroundColor: blue,
  ...props,
}))

const LiBare = styled.li(({ ...props }) => ({
  margin: 0,
  textIndent: 0,
  padding: 0,
  listStyleType: 'none',
  ...props,
}))

const hueToBorderColor: Record<Hue, string> = {
  none: 'border',
  default: 'border',
  lighter: 'border-fill-two',
  lightest: 'border-fill-three',
}

const ListItem = styled(LiBare)(({ theme, hue = 'default' }) => ({
  padding: `${theme.spacing.xsmall}px ${theme.spacing.medium}px`,
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.colors[hueToBorderColor[hue]]}`,
  },
}))

export { ListItem, UListBare as List }
