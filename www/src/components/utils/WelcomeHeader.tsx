import { Div, H1, P } from 'honorable'

export function WelcomeHeader({ heading = 'Welcome to Plural', subheading = 'We\'re glad to see you here.' }) {
  return (
    <Div marginBottom="xxlarge">
      <H1 title1>{heading}</H1>
      <P
        body1
        color="text-light"
      >
        {subheading}
      </P>
    </Div>
  )
}
