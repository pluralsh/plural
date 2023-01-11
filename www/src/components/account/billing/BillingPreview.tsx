import { useState } from 'react'
import { Div, Flex, Switch } from 'honorable'

function BillingPreview() {
  const [isProfessional, setIsProfessional] = useState(false)

  return (
    <Div
      backgroundColor="fill-one"
      border="1px solid border"
      borderRadius="large"
      padding="large"
    >
      <Flex
        align="center"
        justify="space-between"
      >
        <Div
          body1
          fontWeight={600}
        >
          Your usage
        </Div>
        <Switch
          checked={isProfessional}
          onChange={event => setIsProfessional(event.target.checked)}
        >
          <Div
            color="text-xlight"
            marginLeft="xxsmall"
          >
            Preview Professional plan
          </Div>
        </Switch>
      </Flex>
    </Div>
  )
}

export default BillingPreview
