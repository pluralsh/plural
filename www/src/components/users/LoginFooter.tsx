import { Div } from 'honorable'
import styled from 'styled-components'

import Cookiebot from '../../utils/cookiebot'

export const FooterLink = styled.a(({ theme }) => ({
  '&, &:any-link': {
    ...theme.partials.text.caption,
    display: 'block',
    fontSize: 10,
    lineHeight: '14px',
    color: theme.colors['text-xlight'],
    textDecoration: 'none',
  },
  '&:any-link:hover': {
    color: theme.colors['text-light'],
    textDecoration: 'underline',
  },
}))

export function Footer(props) {
  return (
    <Div
      flexGrow={1}
      flexShrink={0}
      {...props}
    >
      <FooterList>
        <FooterLink as="div">
          © Plural Labs {new Date().toLocaleString('en-us', { year: 'numeric' })}
        </FooterLink>
        <FooterLink
          href="https://www.plural.sh/legal/privacy-policy"
          target="_blank"
        >
          Privacy Policy
        </FooterLink>
        <FooterLink href="https://www.plural.sh/legal/terms-and-conditions">
          Terms & Conditions
        </FooterLink>
        <FooterLink
          href=""
          onClick={e => {
            e.preventDefault()
            Cookiebot.show()
          }}
        >
          Cookie settings
        </FooterLink>
      </FooterList>
    </Div>
  )
}

const breakpoint = '@media screen and (min-width: 614px)'

export const FooterList = styled.div(({ theme }) => ({
  paddingTop: theme.spacing.xxlarge,
  paddingBottom: theme.spacing.medium,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.xxsmall,
  alignItems: 'center',
  justifyContent: 'end',
  textAlign: 'center',
  color: 'text-xlight',
  minHeight: theme.spacing.xxxlarge,
  height: '100%',
  [breakpoint]: {
    flexDirection: 'row',
    gap: theme.spacing.xlarge,
    alignItems: 'end',
    justifyContent: 'center',
  },
}))

export const FooterBalancer = styled.div(({ theme }) => ({
  flexGrow: 1,
  flexShrink: 0,
  height: theme.spacing.xxlarge,
}))
