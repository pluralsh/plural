import { Flex } from 'honorable'

function TopBar(props: object) {
  return (
    <Flex
      marginHorizontal="large"
      flexShrink={0}
      height={57}
      alignItems="flex-end"
      {...props}
    />
  )
}

export default TopBar
