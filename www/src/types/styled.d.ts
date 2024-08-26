// import original module declarations
import { CSSProp } from 'styled-components'

import { type styledTheme } from '@pluralsh/design-system'

// Allow css prop on html elements
declare module 'react' {
  interface Attributes {
    css?: CSSProp | undefined
  }
}

type StyledTheme = typeof styledTheme

// extend original module declarations
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends StyledTheme {}
  export declare function useTheme(): DefaultTheme
}
