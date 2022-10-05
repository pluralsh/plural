import { useContext, useMemo } from 'react'
import { A, Flex, P } from 'honorable'
import { Button, Codeline } from 'pluralsh-design-system'
import { Link } from 'react-router-dom'

import { retrieveApplications, retrieveProvider, retrieveStack } from 'components/shell/persistance'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import OnboardingNavSection from '../OnboardingNavSection'

import OnboardingCard from '../OnboardingCard'

function CliCompletion() {
  const { previous } = useContext(CreateShellContext)
  const provider = useMemo(() => retrieveProvider(), [])
  const applications = useMemo(() => retrieveApplications(), [])
  const _stack = useMemo(() => retrieveStack(), [])
  const appInstallCmds = applications.map(app => {
    const recipes = app.recipes.filter(recipe => recipe.provider.toLowerCase() === provider.toLowerCase())

    if (recipes?.length !== 1) return // There should be only one bundle for each provider.

    return <Codeline key={app.id}>plural bundle install {app.name} {recipes[0].name}</Codeline>
  })

  return (
    <>
      <OnboardingCard title="Complete setup">
        <P>Now that you've installed the Plural CLI, here are the next steps:</P>
        <Flex
          direction="column"
          gap="medium"
          marginVertical="large"
        >
          <Codeline>plural init</Codeline>
          {appInstallCmds}
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
      </OnboardingCard>
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
    </>
  )
}

export default CliCompletion
