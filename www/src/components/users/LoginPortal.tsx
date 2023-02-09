import { styledTheme } from '@pluralsh/design-system'
import { Div, Flex, Img } from 'honorable'

import { LOGIN_SIDEBAR_IMAGE } from '../constants'

import { Footer, FooterBalancer } from './LoginFooter'

export const RIGHT_CONTENT_MAX_WIDTH = 512
export const RIGHT_CONTENT_PAD = styledTheme.spacing.xxlarge
export const LOGIN_BREAKPOINT = `@media screen and (min-width: ${
  RIGHT_CONTENT_MAX_WIDTH + RIGHT_CONTENT_PAD * 2
}px)`

export function LoginPortal({ children }: any) {
  return (
    <Flex height="100vh">
      {/* LEFT SIDE */}
      <Flex
        direction="column"
        align="center"
        background="fill-one"
        display-desktop-down="none"
        overflow="hidden"
        width={504}
        height="100%"
      >
        <Img
          src={LOGIN_SIDEBAR_IMAGE}
          width="100%"
          height="100%"
          objectFit="cover"
          objectPosition="top center"
        />
      </Flex>
      {/* RIGHT SIDE */}
      <Flex
        overflow="auto"
        flexDirection="column"
        grow={1}
        shrink={1}
        paddingHorizontal={RIGHT_CONTENT_PAD}
      >
        <FooterBalancer />
        <Div
          maxWidth={RIGHT_CONTENT_MAX_WIDTH}
          width="100%"
          marginVertical="auto"
          marginHorizontal="auto"
        >
          {children}
        </Div>
        <Footer />
      </Flex>
    </Flex>
  )
}
