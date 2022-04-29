import { Div, Input } from 'honorable'

function ResponsiveInput({ label, labelWidth, ...props }) {
  return (
    <Div xflex="x4s">
      <Div
        px={1}
        xflex="x4"
        width={labelWidth}
        backgroundColor="background-light"
        borderTopLeftRadius={4}
        borderBottomLeftRadius={4}
      >
        {label}
      </Div>
      <Input
        {...props}
        flexGrow={1}
        borderTopLeftRadius={0}
        borderBottomLeftRadius={0}
      />
    </Div>
  )
}

export default ResponsiveInput
