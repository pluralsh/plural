import { Flex } from '@pluralsh/design-system'
import { ReactNode } from 'react'
import { useTheme } from 'styled-components'

function BillingError({ children }: { children?: ReactNode }) {
  const theme = useTheme()

  return (
    <Flex
      flexGrow={1}
      align="center"
      justify="center"
      css={{ ...theme.partials.text.body2 }}
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
