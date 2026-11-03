import { Flex, styledTheme } from '@pluralsh/design-system'

import styled from 'styled-components'
import { Footer, FooterBalancer } from './LoginFooter'
import { Suspense } from 'react'
import LoadingIndicator from 'components/utils/LoadingIndicator'
import { MobiusHero } from './MobiusHero'

export const RIGHT_CONTENT_MAX_WIDTH = 400
export const RIGHT_CONTENT_PAD = styledTheme.spacingPx.xxlarge
export const LOGIN_BREAKPOINT = `@media screen and (min-width: ${
  RIGHT_CONTENT_MAX_WIDTH + RIGHT_CONTENT_PAD * 2
}px)`

// Below this width the hero is hidden and the form takes the whole screen
const HERO_BREAKPOINT = '@media screen and (max-width: 999px)'

export function LoginPortal({ children }: any) {
  return (
    <WrapperSC>
      <Flex
        direction="column"
        flex="1 1 440px"
        minWidth={0}
        height="100vh"
        overflow="auto"
        paddingLeft={RIGHT_CONTENT_PAD}
        paddingRight={RIGHT_CONTENT_PAD}
      >
        <FooterBalancer />
        <div
          css={{
            margin: 'auto',
            maxWidth: RIGHT_CONTENT_MAX_WIDTH,
            width: '100%',
          }}
        >
          <Suspense fallback={<LoadingIndicator />}>{children}</Suspense>
        </div>
        <Footer />
      </Flex>
      <HeroWrapperSC>
        <MobiusHero />
      </HeroWrapperSC>
    </WrapperSC>
  )
}

const WrapperSC = styled.div(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  background: theme.colors['fill-zero'],
}))
const HeroWrapperSC = styled.div({
  display: 'flex',
  flex: '1.25 1 520px',
  minWidth: 0,
  [HERO_BREAKPOINT]: { display: 'none' },
})
