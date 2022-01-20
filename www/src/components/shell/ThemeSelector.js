import React, { useCallback, useState } from 'react'
import { Box, TextInput, Text } from 'grommet'
import { normalizedThemes, saveTheme } from './themes'
import { Button } from 'forge-core'

const COLOR_SIZE = '14px'

function ThemeColors({theme}) {
  return (
    <Box flex={false} direction='row' align='center'>
      {Object.values(theme).map((color, ind) => (
        <Box key={`${ind}`} flex={false} background={color}
             width={COLOR_SIZE} height={COLOR_SIZE} />
      ))}
    </Box>
  )
}

function ThemeOption({name, theme}) {
  return (
    <Box flex={false} direction='row' gap='small' align='center' pad='xsmall'>
      <ThemeColors theme={theme} />
      <Text size='small' weight={500}>{name}</Text>
    </Box>
  )
}

const filterThemes = (value) => {
  return Object.entries(normalizedThemes)
    .filter(([key, _]) => key.includes(value))
    .map(([key, theme]) => (
      {value: key, label: <ThemeOption name={key} theme={theme} />}
    ))
}

export function ThemeSelector({theme}) {
  const [value, setValue] = useState(theme)
  const currentTheme = normalizedThemes[theme]
  const save = useCallback(() => {
    saveTheme(value)
    window.location.reload()
  }, [value])

  return (
    <Box flex={false} direction='row' gap='small' align='center'>
      <ThemeColors theme={currentTheme} />
      <TextInput
        value={value}
        onChange={({target: {value}}) => setValue(value)}
        onSelect={({suggestion: {value}}) => setValue(value)}
        suggestions={filterThemes(value)} />
      <Button label='Save' onClick={save} />
    </Box>
  )
}