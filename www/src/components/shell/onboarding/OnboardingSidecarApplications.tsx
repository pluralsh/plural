import { Flex, P } from 'honorable'
import { RepositoryChip } from 'pluralsh-design-system'
import capitalize from 'lodash/capitalize'

import { usePersistedApplications } from '../usePersistance'

function OnboardingSidecarApplications() {
  const [selectedApplications] = usePersistedApplications()

  return (
    <Flex
      border="1px solid border"
      borderRadius="large"
      padding="medium"
      direction="column"
    >
      <P
        overline
        textTransform="uppercase"
      >
        Selected apps
      </P>
      {selectedApplications.map(application => (
        <RepositoryChip
          key={application.id}
          imageUrl={application.darkIcon || application.icon}
          label={capitalize(application.name)}
          checked={false}
          marginTop="medium"
          backgroundColor="transparent"
          border="none"
          padding="none"
          cursor="auto"
        />
      ))}
    </Flex>
  )
}

export default OnboardingSidecarApplications
