import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { useQuery } from '@apollo/client'
import {
  Button,
  Div,
  Flex,
  Hr,
  P,
  Switch,
} from 'honorable'
import {
  InfoIcon,
  Input,
  LoopingLogo,
  MagnifyingGlassIcon,
  RepositoryChip,
  StackIcon,
  Tooltip,
} from 'pluralsh-design-system'
import capitalize from 'lodash/capitalize'
import Fuse from 'fuse.js'

import SelectedApplicationsContext from 'contexts/SelectedApplicationsContext'

import { persistConsole, persistProvider, persistStack } from 'components/shell/persistance'

import { APPLICATIONS_QUERY, STACKS_QUERY, STACK_QUERY } from '../../queries'
import { MAX_SELECTED_APPLICATIONS } from '../../constants'

import OnboardingCard from '../OnboardingCard'
import useOnboarded from '../useOnboarded'

// TODO move this to the DS or the database
const hues = ['blue', 'green', 'yellow', 'red']
const hueToColor = {
  blue: 'border-outline-focused',
  green: 'text-success-light',
  yellow: 'text-warning-light',
  red: 'text-error-light',
}

const CONSOLE_APP_NAME = 'console'

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
  const { data: stacksData } = useQuery(STACKS_QUERY,
    {
      variables: {
        featured: true,
      },
      skip: isStack,
    })
  const { data: stackData, loading: stackLoading, error: stackError } = useQuery(STACK_QUERY, {
    variables: {
      name: stackName,
      provider: stackProvider,
    },
    skip: !isStack,
  })
  const { mutation: onboardMutation, fresh } = useOnboarded()
  const navigate = useNavigate()
  const stackDisplayName = stackData?.stack?.displayName || `${capitalize(stackData?.stack?.name)} Stack`

  const getApplications = useCallback(() => {
    if (!applicationsData || (isStack && !stackData)) return []

    const stackApplicationsIds = isStack
      ? stackData.stack.collections.find(x => x.provider === stackProvider).bundles.map(x => x.recipe.repository.id)
      : []

    return applicationsData.repositories.edges
      .map(x => x.node)
       // airflow is a pain in the butt here
       // console is handled by 'Install Plural Console' toggle switch
      .filter(x => !x.private && x.name !== 'airflow' && x.name !== 'console')
      .filter(x => (isStack && stackData ? stackApplicationsIds.includes(x.id) : true))
  }, [applicationsData, isStack, stackData, stackProvider])
  const consoleApp = useMemo(() => applicationsData?.repositories?.edges?.find(({ node: a }) => a.name === CONSOLE_APP_NAME).node, [applicationsData])
  const selectedAppsCount = useMemo(() => selectedApplications.filter(a => (a.name !== CONSOLE_APP_NAME)).length, [selectedApplications])

  useEffect(() => {
    if (isStack && stackData) {
      persistStack(stackData.stack)
    }
  }, [isStack, stackData])

  useEffect(() => {
    if (isStack && stackData && applicationsData) {
      setSelectedApplications(getApplications())
    }
  }, [isStack, stackData, applicationsData, getApplications, setSelectedApplications])

  useEffect(() => {
    if (stackProvider) {
      persistProvider(stackProvider)
    }
  }, [stackProvider])

  const setSelectedConsole = useCallback((selected: boolean) => {
    if (!consoleApp) {
      return
    }
    setSelectedApplications(applications => {
      if (applications.find(a => a.id === consoleApp.id)) {
        if (!selected) {
          applications = applications.filter(a => a.id !== consoleApp.id)
        }
      }
      else if (selected) {
        applications = [...applications, consoleApp]
      }

      return applications
    })
  }, [consoleApp, setSelectedApplications])

  useEffect(() => {
    setSelectedConsole(!isStack ? shouldInstallConsole : false)
    persistConsole(isStack ? shouldInstallConsole : false)
  }, [isStack, shouldInstallConsole, setSelectedConsole])

  function toggleApplication(application: any) {
    if (isStack) return
    if (application.id === consoleApp?.id) {
      setShouldInstallConsole(!selectedApplications.find(a => a.id === consoleApp.id))

      return
    }

    setSelectedApplications(applications => {
      if (applications.find(a => a.id === application.id)) {
        applications = applications.filter(a => a.id !== application.id)
      }
      // Don't count plural console against MAX_SELECTED_APPLICATIONS limit
      else if (selectedAppsCount < MAX_SELECTED_APPLICATIONS) {
        applications = [...applications, application]
      }

      return applications
    })
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

  function renderApplicationsSubHeader() {
    return (
      <>
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
          marginBottom="large"
        />
      </>
    )
  }

  function renderStackSubHeader() {
    return (
      <P
        body2
        color="text-light"
        marginTop="xsmall"
        marginBottom="large"
      >
        {capitalize(stackData.stack.description)}
      </P>
    )
  }

  function renderStacks() {
    if (!stacksData?.stacks?.edges?.length) return null

    return (
      <>
        <Div
          flexShrink={0}
          overflowY="auto"
          display="grid"
          gridTemplateColumns="repeat(3, 1fr)"
          gridTemplateRows="repeat(auto-fill, 42px)"
          gridColumnGap="16px"
          gridRowGap="16px"
        >
          {stacksData.stacks.edges.map(x => x.node).map((stack, i) => (
            <RepositoryChip
              key={stack.id}
              icon={(
                <StackIcon />
              )}
              label={`${capitalize(stack.name)} Stack`}
              border={`1px solid ${hueToColor[hues[i]]}`}
              checked={false}
              as={Link}
              to={`/shell?stackName=${stack.name}&stackProvider=GCP`}
              cursor="pointer"
              textDecoration="none"
              color="inherit"
            />
          ))}
        </Div>
        <Hr
          width="100%"
          marginTop="large"
          marginBottom="large"
          flexShrink={0}
          borderTop="1px solid border-fill-two"
        />
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
          <Tooltip
            label="Plural Console is a web-based dashboard that allows you to manage your Plural apps and clusters."
            width="350px"
          >
            <InfoIcon />
          </Tooltip>
        </Flex>
      </Switch>
    )
  }

  function renderApplicationsFooter() {
    return (
      <P color="text-light">
        {selectedAppsCount
          ? `${selectedAppsCount} out of ${MAX_SELECTED_APPLICATIONS} apps selected`
          : '0 apps selected'}
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
      title={isStack ? ` Install the ${stackDisplayName}` : 'Choose applications'}
      flexGrow={1}
    >
      {isStack ? renderStackSubHeader() : renderApplicationsSubHeader()}
      {!isStack && !search && renderStacks()}
      {!!filteredApplications.length && (
        <Div
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
              checked={
                !!selectedApplications.find(a => a.id === application.id)
              }
              onClick={() => toggleApplication(application)}
              cursor={
                isStack
                  ? 'auto'
                  : selectedAppsCount >= MAX_SELECTED_APPLICATIONS
                    && !selectedApplications.find(a => a.id === application.id)
                    ? 'not-allowed'
                    : 'pointer'
              }
              opacity={
                selectedAppsCount >= MAX_SELECTED_APPLICATIONS
                && !selectedApplications.find(a => a.id === application.id)
                  ? 0.5
                  : 1
              }
            />
          ))}
        </Div>
      )}
      {!filteredApplications.length && (
        <Flex
          direction="column"
          align="center"
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
      <Flex paddingBottom="large">
        {renderConsoleSwitch()}
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
          onClick={onNext}
          disabled={!selectedAppsCount}
          marginLeft="medium"
        >
          Continue
        </Button>
      </Flex>
    </OnboardingCard>
  )
}

export default ApplicationsSelection
