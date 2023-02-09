import { Flex, Spinner } from 'honorable'

function BillingLoading() {
  return (
    <Flex
      flexGrow={1}
      align="center"
      justify="center"
    >
      <Spinner />
    </Flex>
  )
}

export default BillingLoading
