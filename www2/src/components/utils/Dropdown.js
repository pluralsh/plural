import { normalizeColor } from 'grommet/utils'
import React, { useContext } from 'react'
import Select from 'react-select'
import { ThemeContext } from 'styled-components'

export function Dropdown(props) {
  const plrlTheme = useContext(ThemeContext)

  return (
    <Select
      theme={theme => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary25: normalizeColor('tone-light', plrlTheme),
          primary: normalizeColor('brand', plrlTheme),
        },
      })} 
      {...props}
    />
  )
}
