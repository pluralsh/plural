// import original module declarations
import 'styled-components'

import { type styledTheme } from '@pluralsh/design-system'

// Allow css prop on html elements
import type {} from 'styled-components/cssprop'

type StyledTheme = typeof styledTheme

// and extend them!
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends StyledTheme {}
  export declare function useTheme(): DefaultTheme
}
