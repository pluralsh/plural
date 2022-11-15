// import original module declarations
import 'styled-components'
import { styledTheme } from '@pluralsh/design-system'

type StyledTheme = typeof styledTheme

// and extend them!
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends StyledTheme {}
}
