import { Flex } from 'honorable'
import { Button } from '@pluralsh/design-system'
import { useCallback, useContext } from 'react'
import { ApolloError } from '@apollo/client/errors'

import { OnboardingContext } from '../../context/onboarding'
import { CloudShell } from '../../../../../generated/graphql'

import { ShellStatus } from './ShellStatus'

const EMPTY_SHELL = ({ alive: false, status: {} }) as CloudShell

function CreateShell() {
  const data = { shell: undefined }
  const error = undefined
  // const error = {
  //   graphQLErrors: [
  //     { message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
  //     { message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  //     { message: 'Lorem ipsum dolor sit amet.' },
  //     { message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
  //   ],
  // } as ApolloError
  const { setSection } = useContext(OnboardingContext)
  const onBack = useCallback(() => setSection(s => ({ ...s, state: undefined })), [setSection])

  return (
    <>
      <ShellStatus
        shell={data?.shell || EMPTY_SHELL}
        error={error}
      />
      {!!error && (
        <Flex
          gap="medium"
          justify="space-between"
          borderTop="1px solid border"
          paddingTop="large"
          paddingBottom="xsmall"
          paddingHorizontal="large"
        >
          <Button
            secondary
            onClick={onBack}
          >Back
          </Button>
          <Button>
            Restart Build
          </Button>
        </Flex>
      )}
    </>
  )
}

export default CreateShell
