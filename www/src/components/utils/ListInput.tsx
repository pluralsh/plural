import { Input } from '@pluralsh/design-system'
import { ComponentProps, useContext } from 'react'
import styled from 'styled-components'

import { ListContext, hueToBorderColor } from './List'

export default function ListInput(props: ComponentProps<typeof Input>) {
  const { hue } = useContext(ListContext)

  return (
    <ListInputSC
      $hue={hue}
      {...props}
    />
  )
}

const ListInputSC = styled(Input)<{ $hue: keyof typeof hueToBorderColor }>(({
  theme,
  $hue,
}) => {
  const bRad = theme.borderRadiuses.large - 2

  return {
    position: 'relative',
    border: 'none',
    borderBottomStyle: 'solid',
    borderColor: theme.colors[hueToBorderColor[$hue]] || 'transparent',
    borderWidth: '1px',
    borderRadius: 0,
    '&:focus-within': {
      outline: 'none',
      borderColor: theme.colors[hueToBorderColor[$hue]] || 'transparent',
    },
    '&:focus-within:after': {
      borderRadius: `${bRad}px ${bRad}px 0 0`,
      ...theme.partials.focus.insetAbsolute,
    },
  }
})
