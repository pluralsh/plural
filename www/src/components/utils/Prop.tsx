import { Div } from 'honorable'

export default function Prop({
  children,
  title,
  margin = 'medium',
  ...props
}: any) {
  return (
    <Div margin={margin}>
      <Div
        caption
        color="text-xlight"
        marginBottom="xxsmall"
      >
        {title}
      </Div>
      <Div {...props}>{children}</Div>
    </Div>
  )
}
