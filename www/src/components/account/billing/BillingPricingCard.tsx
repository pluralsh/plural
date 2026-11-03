import { CheckIcon, Flex, PlusIcon } from '@pluralsh/design-system'
import { ReactNode } from 'react'
import { useTheme } from 'styled-components'

import { OverlineH1, Subtitle1H1 } from '../../utils/Typography'

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
  const theme = useTheme()

  return (
    <Flex
      direction="column"
      flexGrow={1}
      backgroundColor={theme.colors['fill-one']}
      padding="large"
      borderRadius={theme.borderRadiuses.large}
      border={`1px solid ${
        selected ? theme.colors['border-fill-two'] : theme.colors.border
      }`}
    >
      <Subtitle1H1 as="div">{title}</Subtitle1H1>
      <OverlineH1
        as="div"
        $color="text-xlight"
        css={{ marginTop: theme.spacing.xsmall }}
      >
        {subtitle}
      </OverlineH1>
      <Flex
        direction="column"
        gap="xsmall"
        marginTop="large"
        color={theme.colors['text-xlight']}
      >
        {items.map((item) => (
          <Flex
            key={item.label}
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
            <div>{item.label}</div>
          </Flex>
        ))}
      </Flex>
      <div css={{ flexGrow: 1 }} />
      <Flex
        marginTop="xxlarge"
        align="center"
        justify="center"
      >
        {callToAction}
      </Flex>
    </Flex>
  )
}

export default BillingPricingCard
