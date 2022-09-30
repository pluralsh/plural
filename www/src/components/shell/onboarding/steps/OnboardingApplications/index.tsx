import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
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
import { useQuery } from '@apollo/client'
import capitalize from 'lodash/capitalize'
import Fuse from 'fuse.js'

import {
  usePersistedApplications,
  usePersistedConsole,
  usePersistedProvider,
  usePersistedStack,
} from 'components/shell/usePersistance'

import { APPLICATIONS_QUERY, STACK_QUERY } from '../../../queries'
import { MAX_SELECTED_APPLICATIONS, SECTION_APPLICATIONS } from '../../../constants'
import useOnboarded from '../../../useOnboarded'

import OnboardingCard from '../../OnboardingCard'

import useOnboardingNavigation from '../../useOnboardingNavigation'

const searchOptions = {
  keys: ['name'],
  threshold: 0.25,
}

function OnboardingApplications() {
  const [searchParams] = useSearchParams()
  const stackName = searchParams.get('stackName')
  const stackProvider = searchParams.get('stackProvider')
  const isStack = !!(stackName && stackProvider)
  const [selectedApplications, setSelectedApplications] = usePersistedApplications()
  const [, setProvider] = usePersistedProvider()
  const [, setStack] = usePersistedStack()
  const [, setConsole] = usePersistedConsole()
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
  const { mutation: onboardMutation, fresh } = useOnboarded()
  const navigate = useNavigate()
  const { nextTo } = useOnboardingNavigation(SECTION_APPLICATIONS)

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
    if (isStack && stackData) {
      setStack(stackData.stack)
    }
  }, [isStack, stackData, setStack])

  useEffect(() => {
    if (isStack && stackData && applicationsData) {
      setSelectedApplications(getApplications())
    }
  }, [isStack, stackData, applicationsData, getApplications, setSelectedApplications])

  useEffect(() => {
    if (stackProvider) {
      setProvider(stackProvider)
    }
  }, [stackProvider, setProvider])

  useEffect(() => {
    setConsole(isStack ? shouldInstallConsole : false)
  }, [isStack, shouldInstallConsole, setConsole])

  function toggleApplication(application: any) {
    setSelectedApplications(applications => (
      applications.find(a => a.id === application.id)
        ? applications.filter(a => a.id !== application.id)
        : [...applications, application].filter((_x, i) => i < MAX_SELECTED_APPLICATIONS)
    ))
  }

  function handleSkipDemo() {
    onboardMutation().then(() => navigate('/marketplace'))
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
        An error occurred, please reload the page.
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
    <OnboardingCard flexGrow={1}>
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
          minHeight={42 + 16}
        >
          {filteredApplications.map(application => (
            <RepositoryChip
              key={application.id}
              imageUrl={application.darkIcon || application.icon}
              label={application.name}
              checked={!!selectedApplications.find(a => a.id === application.id)}
              onClick={() => (isStack ? null : toggleApplication(application))}
              cursor={selectedApplications.length >= MAX_SELECTED_APPLICATIONS && !selectedApplications.find(a => a.id === application.id) ? 'not-allowed' : 'pointer'}
              opacity={selectedApplications.length >= MAX_SELECTED_APPLICATIONS && !selectedApplications.find(a => a.id === application.id) ? 0.5 : 1}
            />
          ))}
        </Div>
      )}
      <Flex paddingBottom="large">
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
      </Flex>
      <Flex
        align="center"
        paddingTop="large"
        borderTop="1px solid border"
      >
        {fresh && (
          <Button
            tertiary
            onClick={handleSkipDemo}
          >
            Skip demo
          </Button>
        )}
        <Div flexGrow={1} />
        {isStack ? renderStackFooter() : renderApplicationsFooter()}
        <Button
          primary
          as={Link}
          to={nextTo}
          disabled={!selectedApplications.length}
          marginLeft="medium"
        >
          Continue
        </Button>
      </Flex>
    </OnboardingCard>
  )
}

export default OnboardingApplications
