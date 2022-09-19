import { useState } from 'react'
import { useQuery } from '@apollo/client'
import {
  Button,
  Div,
  Flex,
  H2,
  P,
} from 'honorable'
import {
  Input,
  LoopingLogo,
  MagnifyingGlassIcon,
  RepositoryChip,
} from 'pluralsh-design-system'
import capitalize from 'lodash/capitalize'

import { APPLICATIONS_QUERY } from '../../queries'
import { MAX_SELECTED_APPLICATIONS } from '../../constants'

import OnboardingCard from '../OnboardingCard'

type ApplicationsSelectionProps = {
  onNext: () => void
}

function ApplicationsSelection({ onNext }: ApplicationsSelectionProps) {
  const [search, setSearch] = useState('')
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([])
  const { data, loading, error } = useQuery(APPLICATIONS_QUERY)

  function toggleApplication(id: string) {
    setSelectedApplicationIds(ids => (ids.includes(id) ? ids.filter(_id => _id !== id) : [...ids, id].filter((_x, i) => i < MAX_SELECTED_APPLICATIONS)))
  }

  function handleSkipDemo() {

  }

  if (loading) {
    return (
      <Flex
        flexGrow={1}
        align="center"
        justify="center"
        padding="xlarge"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  if (!data || error) {
    return (
      <Flex
        flexGrow={1}
        align="center"
        justify="center"
        padding="xlarge"
      >
        An error occured, please reload the page.
      </Flex>
    )
  }

  const applications = data.repositories.edges
    .map(x => x.node)
    .filter(x => !x.private)

  return (
    <OnboardingCard
      flexGrow={1}
      overflow="hidden"
    >
      <Flex
        direction="column"
        flexGrow={1}
        overflow="hidden"
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
          Plural has over {Math.floor(applications.length / 10) * 10} open-source apps to choose from. Select up to five apps to begin.
        </P>
        <Input
          autoFocus
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search an application"
          startIcon={(
            <MagnifyingGlassIcon />
          )}
          width="100%"
          marginTop="large"
        />
        <Div
          marginTop="medium"
          flexGrow={1}
          overflowY="auto"
          display="grid"
          gridTemplateColumns="repeat(3, 1fr)"
          gridTemplateRows="1fr"
          gridColumnGap="16px"
          gridRowGap="16px"
          paddingRight="xsmall"
          paddingBottom="medium"
        >
          {applications.map(application => (
            <RepositoryChip
              imageUrl={application.icon}
              label={capitalize(application.name)}
              checked={selectedApplicationIds.includes(application.id)}
              onClick={() => toggleApplication(application.id)}
            />
          ))}
        </Div>
        <Flex
          align="center"
          marginTop="large"
        >
          <Button
            tertiary
            onClick={handleSkipDemo}
          >
            Skip demo
          </Button>
        </Flex>
      </Flex>
    </OnboardingCard>
  )
}

export default ApplicationsSelection
