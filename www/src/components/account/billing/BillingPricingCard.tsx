import { Div, Flex } from 'honorable'
import { CheckIcon, PlusIcon } from '@pluralsh/design-system'
import { ReactNode } from 'react'

type BillingPricingCardPropsType = {
  title: string
  subtitle: ReactNode
  items: {
    label: string
    checked: boolean
  }[]
  callToAction: ReactNode
  selected?: boolean
}

function BillingPricingCard({
  title,
  subtitle,
  items,
  callToAction,
  selected,
}: BillingPricingCardPropsType) {
  return (
    <Flex
      direction="column"
      flexGrow={1}
      backgroundColor="fill-one"
      padding="large"
      borderRadius="large"
      border={`1px solid ${selected ? 'border-fill-two' : 'border'}`}
    >
      <Div subtitle1>
        {title}
      </Div>
      <Div
        overline
        color="text-xlight"
        marginTop="xsmall"
      >
        {subtitle}
      </Div>
      <Flex
        direction="column"
        gap="xsmall"
        marginTop="large"
        color="text-xlight"
      >
        {items.map(item => (
          <Flex
            align="center"
            gap="small"
          >
            {item.checked && (
              <CheckIcon
                color="icon-success"
                size={12}
              />
            )}
            {!item.checked && (
              <PlusIcon
                color="icon-default"
                size={12}
              />
            )}
            <Div>{item.label}</Div>
          </Flex>
        ))}
      </Flex>
      <Div flexGrow={1} />
      <Flex
        marginTop="large"
        align="center"
        justify="center"
      >
        {callToAction}
      </Flex>
    </Flex>
  )
}

export default BillingPricingCard
