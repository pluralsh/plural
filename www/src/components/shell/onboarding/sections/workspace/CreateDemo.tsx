import { useEffect } from 'react'
import { Button, ReloadIcon } from '@pluralsh/design-system'
import { Flex } from 'honorable'

import { useSectionState } from '../../context/hooks'
import { CreateCloudShellSectionState } from '../../context/types'

import { DemoStatus } from './DemoStatus'

function CreateDemo({ onBack }): JSX.Element {
  const setSectionState = useSectionState()
  // const error = { graphQLErrors: [{ message: 'some error' }] }
  const error = undefined

  // On init set mode to creation
  useEffect(() => setSectionState(CreateCloudShellSectionState.Creating), [setSectionState])

  return (
    <>
      <DemoStatus
        loading
        error={error}
      />
      {!!error && (
        <Flex
          gap="large"
          borderTop="1px solid border"
          paddingTop="large"
          paddingBottom="xsmall"
          paddingHorizontal="large"
          direction="column"
          marginTop="medium"
        >
          <Flex
            justify="space-between"
            grow={1}
            gap="medium"
          >
            <Button
              secondary
              onClick={onBack}
            >Back
            </Button>
            <Button
              data-phid="review-configuration"
              startIcon={<ReloadIcon />}
              alignSelf="flex-end"
              width="fit-content"
            >
              Retry
            </Button>
          </Flex>
        </Flex>
      )}
    </>
  )
}

export { CreateDemo }
