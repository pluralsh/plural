import { useContext, useMemo } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useTheme } from 'styled-components'
import { styledTheme } from '@pluralsh/design-system'

import PluralConfigurationContext from '../contexts/PluralConfigurationContext'

export const useStripeAppearance = () => {
  const theme = useTheme() as typeof styledTheme

  return useMemo(() => ({
    theme: 'night' as 'none' | 'flat' | 'night' | 'stripe' | undefined,
    labels: 'above' as 'floating' | 'above' | undefined,
    variables: {
      fontFamily: theme.fontFamilies.sans,
      fontSizeBase: `${theme.partials.text.body2.fontSize}px`,
      spacingUnit: `${theme.spacing.xxsmall}px`,
      borderRadius: `${theme.borderRadiuses.medium}px`,
      colorPrimary: theme.colors['fill-primary'],
      colorBackground: theme.colors['fill-one'],
      colorText: theme.colors.text,
      colorTextPlaceholder: theme.colors['text-xlight'],
      colorDanger: theme.colors['text-danger'],
      colorSuccess: theme.colors['text-success'],
      colorWarning: theme.colors['text-warning'],
      spacingGridRow: `${theme.spacing.medium}px`,
      spacingGridColumn: `${theme.spacing.medium}px`,
      spacingTab: `${theme.spacing.medium}px`,
    },
    rules: {
      '.Label, .Input, .Dropdown': {
        fontSize: `${theme.partials.text.body2Bold.fontSize}px`,
        letterSpacing: `${theme.partials.text.body2Bold.letterSpacing}`,
      },
      '.Label': {
        fontWeight: `${theme.partials.text.body2Bold.fontWeight}`,
        marginBottom: `${theme.spacing.xsmall}px`,
      },
      '.Input, .Dropdown': {
        boxShadow: 'none',
        borderColor: theme.colors['border-input'],
      },
      '.Input:focus': {
        outline: 'none',
        boxShadow: 'none',
        borderColor: theme.colors['border-outline-focused'],
      },
      '.Input--invalid': {
        outline: 'none',
        boxShadow: 'none',
        borderColor: theme.colors['border-danger'],
      },
    },
  }),
  [
    theme.borderRadiuses.medium,
    theme.colors,
    theme.fontFamilies.sans,
    theme.partials.text.body2.fontSize,
    theme.partials.text.body2Bold.fontSize,
    theme.partials.text.body2Bold.fontWeight,
    theme.partials.text.body2Bold.letterSpacing,
    theme.spacing.medium,
    theme.spacing.xsmall,
    theme.spacing.xxsmall,
  ])
}

export function WrapStripe({ children }: any) {
  const { stripePublishableKey } = useContext(PluralConfigurationContext)
  const appearance = useStripeAppearance()

  const stripePromise = useMemo(() => {
    if (stripePublishableKey) {
      return loadStripe(stripePublishableKey)
    }
  }, [stripePublishableKey])

  const options = {
    appearance,
  }

  if (!stripePromise) {
    return children
  }

  return (
    <Elements
      stripe={stripePromise}
      options={options}
    >
      {children}
    </Elements>
  )
}
