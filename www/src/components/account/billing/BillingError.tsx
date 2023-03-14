import { Flex } from 'honorable'
import { ReactNode } from 'react'

function BillingError({ children }: { children?: ReactNode }) {
  return (
    <Flex
      flexGrow={1}
      align="center"
      justify="center"
      body2
    >
      {children ? (
        <>An error occured: {children}</>
      ) : (
        <>An error occured, please reload the page or contact support.</>
      )}
    </Flex>
  )
}

export default BillingError
