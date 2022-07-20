import { ThemeContext } from 'grommet'
import { useContext } from 'react'
import { Chip } from 'pluralsh-design-system'

import { DEFAULT_CHART_ICON, DarkProviderIcons, ProviderIcons } from './constants'

export function Provider({ provider, width, size }) {
  const { dark } = useContext(ThemeContext)
  let url = ProviderIcons[provider] || DEFAULT_CHART_ICON
  if (dark && DarkProviderIcons[provider]) {
    url = DarkProviderIcons[provider]
  }

  return (
    <img
      alt={provider}
      width={`${size || width}px`}
      src={url}
    />
  )
}

export function PackageGrade({ scan }) {
  if (!scan) return null

  return (
    <Chip
      // TODO severity={ColorMap[scan.grade]}
      height={26}
      marginHorizontal="xxsmall"
      fontWeight="600"
      backgroundColor="fill-two"
      borderColor="border-fill-two"
    >
      {scan.grade}
    </Chip>
  )
}

export function dockerPull(registry, { tag, dockerRepository: { name, repository } }) {
  return `${registry}/${repository.name}/${name}:${tag}`
}
