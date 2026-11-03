import { Flex, type FlexProps } from '@pluralsh/design-system'
import { type CSSProperties } from 'react'

import { Title1H1 } from './Typography'

type WelcomeHeaderProps = Omit<FlexProps, 'textAlign'> & {
  heading?: string
  textAlign?: CSSProperties['textAlign']
}

export function WelcomeHeader({
  heading = 'Welcome to Plural',
  textAlign = 'center',
  ...props
}: WelcomeHeaderProps) {
  return (
    <Flex
      direction="column"
      {...props}
    >
      <Title1H1 css={{ textAlign }}>{heading}</Title1H1>
    </Flex>
  )
}
