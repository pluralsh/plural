import { ExtendTheme, Input, InputProps } from 'honorable'
import { forwardRef, useContext } from 'react'
import { useTheme } from 'styled-components'

import { ListContext, hueToBorderColor } from './List'

const ListInput = forwardRef<HTMLDivElement, InputProps>(({
  ...props
}, ref) => {
  const theme = useTheme()
  const { hue } = useContext(ListContext)
  const bRad = theme.borderRadiuses.large - 2

  const themeExtension: any = {
    Input: {
      Root: [{
        position: 'relative',
        border: 'none',
        borderBottomStyle: 'solid',
        borderColor: theme.colors[hueToBorderColor[hue]] || 'transparent',
        borderWidth: '1px',
        borderRadius: 0,
        '&:focus-within': {
          outline: 'none',
        },
        '&:focus-within:after': {
          borderRadius: `${bRad}px ${bRad}px 0 0`,
          ...theme.partials.focus.insetAbsolute,
        },
      }],
    },

  }

  return (
    <ExtendTheme theme={themeExtension}>
      <Input
        ref={ref}
        {...props}
      />
    </ExtendTheme>
  )
})

export default ListInput
