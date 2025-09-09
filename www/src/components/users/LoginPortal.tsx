import { Flex, styledTheme } from '@pluralsh/design-system'

import styled from 'styled-components'
import { Footer, FooterBalancer } from './LoginFooter'
import { Suspense } from 'react'
import LoadingIndicator from 'components/utils/LoadingIndicator'

export const RIGHT_CONTENT_MAX_WIDTH = 512
export const RIGHT_CONTENT_PAD = styledTheme.spacing.xxlarge
export const LOGIN_BREAKPOINT = `@media screen and (min-width: ${
  RIGHT_CONTENT_MAX_WIDTH + RIGHT_CONTENT_PAD * 2
}px)`

const HERO_IMAGE_URL = '/login-bg-img.webp'

export function LoginPortal({ children }: any) {
  return (
    <WrapperSC>
      <Flex
        direction="column"
        flex={1}
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
      <HeroSC />
    </WrapperSC>
  )
}

const WrapperSC = styled.div({
  display: 'grid',
  gridTemplateColumns: '50% 50%',
  gridTemplateRows: '1fr',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
})
const HeroSC = styled.div(({ theme }) => ({
  background: theme.colors['fill-accent'],
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 40,
    backgroundImage:
      'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${HERO_IMAGE_URL})`,
    backgroundSize: '80%',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: 2,
  },
}))
