import { useContext, useMemo } from 'react'
import { A, Flex, P } from 'honorable'
import { Button, Codeline } from '@pluralsh/design-system'
import { Link } from 'react-router-dom'

import {
  retrieveApplications,
  retrieveConsole,
  retrieveProvider,
  retrieveStack,
} from '../../persistance'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import OnboardingNavSection from '../OnboardingNavSection'

import OnboardingCard from '../OnboardingCard'

function CliCompletion() {
  const { previous } = useContext(CreateShellContext)
  const provider = useMemo(() => retrieveProvider(), [])
  const applications = useMemo(() => retrieveApplications(), [])
  const applicationIds = applications.map(x => x.id)
  const stack = useMemo(() => retrieveStack(), [])

  let filteredApplications = applications
  let isStackComplete = false

  if (stack) {
    // If all stack applications are in the list then we can filter them out to show stack install command.
    const stackCollection = stack?.collections?.find(x => x.provider === provider)
    const stackApplicationIds = stackCollection?.bundles.map(x => x.recipe.repository.id)

    isStackComplete = stackApplicationIds?.every(id => applicationIds.includes(id))

    if (isStackComplete) {
      filteredApplications = applications.filter(app => !stackApplicationIds.includes(app.id))
    }
  }

  // Console command should only be added if it is not in the apps list already.
  const shouldInstallConsole = retrieveConsole()
  const isConsoleInApps = filteredApplications.find(app => app.name === 'console')
  const consoleInstallCmd = shouldInstallConsole && !isConsoleInApps
    ? <Codeline>{`plural bundle install console console-${provider?.toLowerCase()}`}</Codeline>
    : null

  const stackInstallCmd = isStackComplete
    ? (<Codeline>plural stack install {stack?.name}</Codeline>)
    : null

  const appInstallCmds = filteredApplications.map(app => {
    const recipes = app.recipes.filter(recipe => recipe.provider.toLowerCase() === provider?.toLowerCase())

    if (recipes?.length !== 1) return // There should be only one bundle for each provider.

    return <Codeline key={app.id}>plural bundle install {app.name} {recipes[0].name}</Codeline>
  })

  return (
    <OnboardingCard title="Complete setup">
      <P>Now that you've installed the Plural CLI, here are the next steps:</P>
      <Flex
        direction="column"
        gap="medium"
        marginVertical="large"
      >
        <Codeline>plural init</Codeline>
        {stackInstallCmd}
        {appInstallCmds}
        {consoleInstallCmd}
        <Codeline>plural build</Codeline>
        <Codeline>plural deploy --commit "first commit"</Codeline>
      </Flex>
      <P>
        If you need help filling out the install wizard during any of these steps,
        visit our{' '}
        <A
          inline
          href="https://docs.plural.sh/getting-started/getting-started"
          target="_blank"
          rel="noopener noreferrer"
        >
          Quickstart Guide
        </A>
        {' '}for more information.
      </P>
      <OnboardingNavSection>
        <Button
          secondary
          onClick={() => previous()}
        >
          Back
        </Button>
        <Button
          primary
          as={Link}
          to="/marketplace"
        >
          Continue to app
        </Button>
      </OnboardingNavSection>
    </OnboardingCard>
  )
}

export default CliCompletion
