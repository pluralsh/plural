import { styledTheme } from '@pluralsh/design-system'

import { Footer, FooterBalancer } from './LoginFooter'

export const RIGHT_CONTENT_MAX_WIDTH = 512
export const RIGHT_CONTENT_PAD = styledTheme.spacing.xxlarge
export const LOGIN_BREAKPOINT = `@media screen and (min-width: ${
  RIGHT_CONTENT_MAX_WIDTH + RIGHT_CONTENT_PAD * 2
}px)`

export function LoginPortal({ children }: any) {
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        flexShrink: 1,
        height: '100vh',
        overflow: 'auto',
        paddingLeft: RIGHT_CONTENT_PAD,
        paddingRight: RIGHT_CONTENT_PAD,
      }}
    >
      <FooterBalancer />
      <div
        css={{
          margin: 'auto',
          maxWidth: RIGHT_CONTENT_MAX_WIDTH,
          width: '100%',
        }}
      >
        {children}
      </div>
      <Footer />
    </div>
  )
}
