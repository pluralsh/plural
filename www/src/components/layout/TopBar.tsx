import { Flex } from 'honorable'

function TopBar(props: object) {
  return (
    <Flex
      flexShrink={0}
      alignItems="flex-end"
      {...props}
    />
  )
}

export default TopBar
