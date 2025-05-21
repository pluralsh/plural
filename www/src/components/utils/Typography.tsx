import { SemanticColorKey } from '@pluralsh/design-system'
import { ComponentPropsWithRef, ReactNode } from 'react'
import styled from 'styled-components'

type TextProps = {
  $color?: SemanticColorKey
}

export const Body1P = styled.p<TextProps>(({ theme, $color }) => ({
  margin: 0,
  ...theme.partials.text.body1,
  color: $color && theme.colors[$color],
}))
export const Body2P = styled.p<TextProps>(({ theme, $color }) => ({
  margin: 0,
  ...theme.partials.text.body2,
  color: $color && theme.colors[$color],
}))
export const Body1BoldP = styled.p<TextProps>(({ theme, $color }) => ({
  margin: 0,
  ...theme.partials.text.body1Bold,
  color: $color && theme.colors[$color],
}))
export const Body2BoldP = styled.p<TextProps>(({ theme, $color }) => ({
  margin: 0,
  ...theme.partials.text.body2Bold,
  color: $color && theme.colors[$color],
}))
export const CaptionP = styled.p<TextProps>(({ theme, $color }) => ({
  margin: 0,
  ...theme.partials.text.caption,
  color: $color && theme.colors[$color],
}))
export const StrongSC = styled.strong<TextProps>(({ theme, $color }) => ({
  margin: 0,
  color: $color && theme.colors[$color],
}))
export const OverlineH1 = styled.h1<TextProps>(({ theme, $color }) => ({
  margin: 0,
  ...theme.partials.text.overline,
  color: $color && theme.colors[$color],
}))
export const Subtitle1H1 = styled.h1<TextProps>(({ theme, $color }) => ({
  margin: 0,
  ...theme.partials.text.subtitle1,
  color: $color && theme.colors[$color],
}))
export const Subtitle2H1 = styled.h1<TextProps>(({ theme, $color }) => ({
  margin: 0,
  ...theme.partials.text.subtitle2,
  color: $color && theme.colors[$color],
}))
export const Title1H1 = styled.h1<TextProps>(({ theme, $color }) => ({
  margin: 0,
  ...theme.partials.text.title1,
  color: $color && theme.colors[$color],
}))
export const Title2H1 = styled.h1<TextProps>(({ theme, $color }) => ({
  margin: 0,
  ...theme.partials.text.title2,
  color: $color && theme.colors[$color],
}))

const StandardUrlSC = styled.a(({ theme }) => ({
  ...theme.partials.text.inlineLink,
}))
export function InlineA({
  href,
  children,
  ...props
}: {
  href: Nullable<string>
  children: ReactNode
} & Omit<ComponentPropsWithRef<typeof StandardUrlSC>, 'children' | 'href'>) {
  return (
    <StandardUrlSC
      href={href || ''}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </StandardUrlSC>
  )
}
