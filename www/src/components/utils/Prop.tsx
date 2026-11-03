import { Flex, type FlexProps } from '@pluralsh/design-system'
import { type ComponentPropsWithRef, type ReactNode } from 'react'
import styled from 'styled-components'

import { CaptionP } from './Typography'

type PropProps = {
  title?: ReactNode
  margin?: FlexProps['margin']
} & ComponentPropsWithRef<'div'>

export default function Prop({
  children,
  title,
  margin = 'medium',
  ...props
}: PropProps) {
  return (
    <Flex
      direction="column"
      margin={margin}
    >
      <PropTitleSC
        as="div"
        $color="text-xlight"
      >
        {title}
      </PropTitleSC>
      <div {...props}>{children}</div>
    </Flex>
  )
}

const PropTitleSC = styled(CaptionP)(({ theme }) => ({
  marginBottom: theme.spacing.xxsmall,
}))
