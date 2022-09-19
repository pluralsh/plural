import { useState } from 'react'
import { Div, H2, P } from 'honorable'
import { Input, MagnifyingGlassIcon } from 'pluralsh-design-system'

import OnboardingCard from '../OnboardingCard'

type ApplicationsSelectionProps = {
  onNext: () => void
}

function ApplicationsSelection({ onNext }: ApplicationsSelectionProps) {
  const [search, setSearch] = useState('')

  return (
    <OnboardingCard>
      <Div
        maxWidth={608}
        marginHorizontal="auto"
      >
        <H2
          subtitle1
          marginTop="medium"
        >
          Choose applications
        </H2>
        <P
          body2
          marginTop="xsmall"
        >
          Plural has over x open-source apps to choose from. Select up to five apps to begin.
        </P>
        <Input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search an application"
          startIcon={(
            <MagnifyingGlassIcon />
          )}
          width="100%"
          marginTop="large"
        />
      </Div>
    </OnboardingCard>
  )
}

export default ApplicationsSelection
