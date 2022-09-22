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
import Fuse from 'fuse.js'

import { APPLICATIONS_QUERY } from '../../queries'
import { MAX_SELECTED_APPLICATIONS } from '../../constants'

import OnboardingCard from '../OnboardingCard'

const searchOptions = {
  keys: ['name'],
  threshold: 0.25,
}

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

  const fuse = new Fuse(applications, searchOptions)
  const filteredApplications = search ? fuse.search(search).map(x => x.item) : applications

  return (
    <OnboardingCard
      flexGrow={1}
      overflow="hidden"
    >
      <H2
        subtitle1
        marginTop="medium"
      >
        Choose applications
      </H2>
      <P
        body2
        color="text-light"
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
      {!!filteredApplications.length && (
        <Div
          marginTop="medium"
          flexGrow={1}
          overflowY="auto"
          display="grid"
          gridTemplateColumns="repeat(3, 1fr)"
          gridTemplateRows="repeat(auto-fill, 42px)"
          gridColumnGap="16px"
          gridRowGap="16px"
          paddingRight="xsmall"
          paddingBottom="medium"
        >
          {filteredApplications.map(application => (
            <RepositoryChip
              imageUrl={application.darkIcon || application.icon}
              label={capitalize(application.name)}
              checked={selectedApplicationIds.includes(application.id)}
              onClick={() => toggleApplication(application.id)}
            />
          ))}
        </Div>
      )}
      {!filteredApplications.length && (
        <Flex
          direction="column"
          align="center"
          marginTop="medium"
          flexGrow={1}
        >
          <P
            body2
            color="text-light"
          >
            No application found for "{search}"
          </P>
          <Button
            secondary
            onClick={() => setSearch('')}
            marginTop="medium"
          >
            Clear search
          </Button>
        </Flex>
      )}
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
        <Div flexGrow={1} />
        <P color="text-light">
          {selectedApplicationIds.length ? `${selectedApplicationIds.length} out of ${MAX_SELECTED_APPLICATIONS} apps selected` : '0 apps selected'}
        </P>
        <Button
          primary
          onClick={onNext}
          disabled={!selectedApplicationIds.length}
          marginLeft="medium"
        >
          Continue
        </Button>
      </Flex>
    </OnboardingCard>
  )
}

export default ApplicationsSelection
