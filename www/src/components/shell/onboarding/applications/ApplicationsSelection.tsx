import {
  useCallback, useContext, useEffect, useState,
} from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import {
  Button,
  Div,
  Flex,
  H2,
  P,
  Switch,
} from 'honorable'
import {
  InfoIcon,
  Input,
  LoopingLogo,
  MagnifyingGlassIcon,
  RepositoryChip,
  Tooltip,
} from 'pluralsh-design-system'
import capitalize from 'lodash/capitalize'
import Fuse from 'fuse.js'

import SelectedApplicationsContext from 'contexts/SelectedApplicationsContext'

import { APPLICATIONS_QUERY, STACK_QUERY } from '../../queries'
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
  const [searchParams] = useSearchParams()
  const stackName = searchParams.get('stackName')
  const stackProvider = searchParams.get('stackProvider')
  const isStack = !!(stackName && stackProvider)
  const { selectedApplications, setSelectedApplications } = useContext(SelectedApplicationsContext)
  const [search, setSearch] = useState('')
  const [shouldInstallConsole, setShouldInstallConsole] = useState(true)
  const { data: applicationsData, loading: applicationsLoading, error: applicationsError } = useQuery(APPLICATIONS_QUERY)
  const { data: stackData, loading: stackLoading, error: stackError } = useQuery(STACK_QUERY, {
    variables: {
      name: stackName,
      provider: stackProvider,
    },
    skip: !isStack,
  })
  const navigate = useNavigate()

  const getApplications = useCallback(() => {
    if (!applicationsData || (isStack && !stackData)) return []

    const stackApplicationsIds = isStack
      ? stackData.stack.collections.find(x => x.provider === stackProvider).bundles.map(x => x.recipe.repository.id)
      : []

    return applicationsData.repositories.edges
      .map(x => x.node)
      .filter(x => !x.private)
      .filter(x => (isStack && stackData ? stackApplicationsIds.includes(x.id) : true))
  }, [applicationsData, isStack, stackData, stackProvider])

  useEffect(() => {
    if (isStack && stackData && applicationsData) {
      const applications = getApplications()

      setSelectedApplications(applications)
    }
  }, [isStack, stackData, applicationsData, getApplications, setSelectedApplications])

  function toggleApplication(application: any) {
    setSelectedApplications(applications => (
      applications.find(a => a.id === application.id)
        ? applications.filter(a => a.id !== application.id)
        : [...applications, application].filter((_x, i) => i < MAX_SELECTED_APPLICATIONS)
    ))
  }

  function handleSkipDemo() {

  }

  function handleSkipStack() {
    navigate(window.location.pathname)
  }

  if (applicationsLoading || (isStack && stackLoading)) {
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

  if (!applicationsData || applicationsError || (isStack && (!stackData || stackError))) {
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

  const applications = getApplications()
  const fuse = new Fuse(applications, searchOptions)
  const filteredApplications = search ? fuse.search(search).map(x => x.item) : applications

  function renderApplicationsHeader() {
    return (
      <>
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
      </>
    )
  }

  function renderStackHeader() {
    return (
      <>
        <H2
          subtitle1
          marginTop="medium"
        >
          Install the {capitalize(stackData.stack.name)} Stack
        </H2>
        <P
          body2
          color="text-light"
          marginTop="xsmall"
        >
          {capitalize(stackData.stack.description)}
        </P>
      </>
    )
  }

  function renderConsoleSwitch() {
    return (
      <Switch
        padding={0}
        marginTop="medium"
        checked={shouldInstallConsole}
        onChange={event => setShouldInstallConsole(event.target.checked)}
      >
        <Flex
          align="center"
          gap="xsmall"
        >
          Install Plural Console
          <Tooltip label={<>Plural Console is a web-based dashboard<br />that allows you to manage your Plural apps and clusters.</>}>
            <InfoIcon />
          </Tooltip>
        </Flex>
      </Switch>
    )
  }

  function renderApplicationsFooter() {
    return (
      <P color="text-light">
        {selectedApplications.length ? `${selectedApplications.length} out of ${MAX_SELECTED_APPLICATIONS} apps selected` : '0 apps selected'}
      </P>
    )
  }

  function renderStackFooter() {
    return (
      <Button
        secondary
        onClick={handleSkipStack}
      >
        Choose other apps
      </Button>
    )
  }

  return (
    <OnboardingCard
      flexGrow={1}
      overflow="hidden"
    >
      {isStack ? renderStackHeader() : renderApplicationsHeader()}
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
              key={application.id}
              imageUrl={application.darkIcon || application.icon}
              label={capitalize(application.name)}
              checked={!!selectedApplications.find(a => a.id === application.id)}
              onClick={() => toggleApplication(application)}
              cursor={selectedApplications.length >= MAX_SELECTED_APPLICATIONS && !selectedApplications.find(a => a.id === application.id) ? 'not-allowed' : 'pointer'}
              opacity={selectedApplications.length >= MAX_SELECTED_APPLICATIONS && !selectedApplications.find(a => a.id === application.id) ? 0.5 : 1}
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
      {isStack && renderConsoleSwitch()}
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
        {isStack ? renderStackFooter() : renderApplicationsFooter()}
        <Button
          primary
          onClick={onNext}
          disabled={!selectedApplications.length}
          marginLeft="medium"
        >
          Continue
        </Button>
      </Flex>
    </OnboardingCard>
  )
}

export default ApplicationsSelection
