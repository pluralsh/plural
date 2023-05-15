// import original module declarations
import 'styled-components'
import { styledTheme } from '@pluralsh/design-system'

import { DEFAULT_THEME } from '../theme'

type StyledTheme = typeof styledTheme & {
  global: (typeof DEFAULT_THEME)['global']
}

// and extend them!
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends StyledTheme {}
}
