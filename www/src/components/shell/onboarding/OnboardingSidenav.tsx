import styled from 'styled-components'
import { useCallback, useContext } from 'react'

import { Stepper } from '@pluralsh/design-system'

import { OnboardingContext } from './context/onboarding'

const expandAtWidth = 160
const ResponsiveWidth = styled.div(({ theme }) => {
  const medMq = '@media only screen and (min-width: 1040px)'
  const desktopMq = `@media only screen and (min-width: ${theme.breakpoints.desktop}px)`
  const desktopLargeMq = `@media only screen and (min-width: ${theme.breakpoints.desktopLarge}px)`

  return {
    width: 68,
    paddingBottom: theme.spacing.large,
    textAlign: 'center',
    [medMq]: {
      width: expandAtWidth,
    },
    [desktopMq]: {
      width: expandAtWidth,
    },
    [desktopLargeMq]: {
      width: 256,
    },
  }
})

function OnboardingSidenav({ section }) {
  const { sections } = useContext(OnboardingContext)
  const toSteps = useCallback(() => Object.values(sections).map(section => ({
    key: section.key,
    stepTitle: section.title,
    IconComponent: section.IconComponent,
  })), [sections])

  return (
    <ResponsiveWidth>
      <Stepper
        vertical
        steps={toSteps()}
        stepIndex={section.index}
        collapseAtWith={expandAtWidth - 1}
      />
    </ResponsiveWidth>
  )
}

export default OnboardingSidenav
