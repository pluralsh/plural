import { Div, H1 } from 'honorable'

export function WelcomeHeader({ heading = 'Welcome to Plural', ...props }: any) {
  return (
    <Div {...props}>
      <H1
        title1
        textAlign="center"
      >{heading}
      </H1>
    </Div>
  )
}
