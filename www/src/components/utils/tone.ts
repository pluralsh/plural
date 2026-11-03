import { DefaultTheme } from 'styled-components'

type Colors = DefaultTheme['colors']

export type Tone = {
  [K in keyof Colors]: Colors[K] extends string ? K : never
}[keyof Colors]

// Translucent tint of a theme color, for tinted card borders and fills.
export function toneMix(theme: DefaultTheme, tone: Tone, pct: number) {
  return `color-mix(in srgb, ${theme.colors[tone]} ${pct}%, transparent)`
}
