import { useContext, useMemo } from 'react'
import { Flex, P } from 'honorable'
import { RepositoryChip } from 'pluralsh-design-system'

import { useQuery } from '@apollo/client'

import SelectedApplicationsContext from '../../../contexts/SelectedApplicationsContext'
import { retrieveConsole } from '../persistance'

import { APPLICATIONS_QUERY } from '../queries'

import { CONSOLE_APP_NAME } from './applications/ApplicationsSelection'

function OnboardingSidecarApplications() {
  const { selectedApplications } = useContext(SelectedApplicationsContext)

  // Console is filtered from selected applications context,
  // so it needs to be added separately if install console toggle is on.
  const { data } = useQuery(APPLICATIONS_QUERY)
  const consoleApp = useMemo(() => data?.repositories?.edges?.find(({ node: a }) => a.name === CONSOLE_APP_NAME).node, [data])
  const shouldInstallConsole = retrieveConsole()
  const isConsoleInApps = selectedApplications.find(app => app.name === CONSOLE_APP_NAME)

  return (
    <Flex
      border="1px solid border"
      borderRadius="large"
      padding="medium"
      direction="column"
    >
      <P overline>Selected apps</P>
      {selectedApplications.map(application => (
        <RepositoryChip
          key={application.id}
          imageUrl={application.darkIcon || application.icon}
          label={application.name}
          marginTop="medium"
          backgroundColor="transparent"
          border="none"
          padding="none"
          cursor="auto"
          _hover={{}}
        />
      ))}
      {shouldInstallConsole && !isConsoleInApps && (
        <RepositoryChip
          imageUrl={consoleApp?.darkIcon || consoleApp?.icon}
          label={consoleApp?.name}
          marginTop="medium"
          backgroundColor="transparent"
          border="none"
          padding="none"
          cursor="auto"
          _hover={{}}
        />
      )}
    </Flex>
  )
}

export default OnboardingSidecarApplications
