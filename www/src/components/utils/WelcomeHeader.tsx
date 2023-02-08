import { Div, H1 } from 'honorable'

export function WelcomeHeader({ heading = 'Welcome to Plural', textAlign = 'center', ...props }: any) {
  return (
    <Div {...props}>
      <H1
        title1
        textAlign={textAlign}
      >{heading}
      </H1>
    </Div>
  )
}
