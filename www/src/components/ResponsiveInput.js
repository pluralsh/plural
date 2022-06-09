import { Flex, Input } from 'honorable'

function ResponsiveInput({ label, labelWidth, ...props }) {
  return (
    <Flex>
      <Flex
        px={1}
        align="center"
        width={labelWidth}
        backgroundColor="fill-one"
        borderTopLeftRadius={4}
        borderBottomLeftRadius={4}
      >
        {label}
      </Flex>
      <Input
        {...props}
        flexGrow={1}
        borderTopLeftRadius={0}
        borderBottomLeftRadius={0}
      />
    </Flex>
  )
}

export default ResponsiveInput
