import { Flex } from 'honorable'

const FORM_WIDTH = '480px'
const SCREEN_WIDTH = '1440px'

export function Container({ type, children, ...props }) {
  return (
    <Flex
      width="100%"
      height="100%"
      justify="center"
    >
      <Flex
        width="100%"
        maxWidth={type === 'form' ? FORM_WIDTH : SCREEN_WIDTH}
        {...props}
      >
        {children}
      </Flex>
    </Flex>
  )
}
