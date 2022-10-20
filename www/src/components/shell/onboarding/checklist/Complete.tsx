import { useMutation } from '@apollo/client'
import {
  A, Button, Div, Flex, Span,
} from 'honorable'
import { GitHubLogoIcon, SourcererIcon } from 'pluralsh-design-system'

import { OnboardingChecklistState } from '../../../../generated/graphql'
import { UPDATE_ONBOARDING_CHECKLIST } from '../../../users/queries'

export function ChecklistComplete({ refetch }) {
  const [updateChecklist, { loading }] = useMutation(UPDATE_ONBOARDING_CHECKLIST)

  return (
    <Flex
      direction="column"
      gap="medium"
    >
      <Flex
        paddingHorizontal="large"
        gap="medium"
      >
        <SourcererIcon />
        <Flex
          gap="xxsmall"
          direction="column"
        >
          <Span subtitle1>Congratulations!</Span>
          <Span body2>You're well on your way to becoming an
            <A
              inline
              href="https://www.plural.sh/community"
              target="_blank"
              rel="noopener noreferrer"
            >
              open-sourcerer
            </A>.
          </Span>
        </Flex>
      </Flex>
      <Div
        height={1}
        backgroundColor="border-input"
      />
      <Flex
        gap="small"
        paddingHorizontal="large"
      >
        <Button
          as="a"
          href="https://github.com/pluralsh/plural"
          target="_blank"
          rel="noopener noreferrer"
          small
          secondary
          startIcon={<GitHubLogoIcon />}
        >Star us on GitHub
        </Button>
        <Flex grow={1} />
        <Button
          small
          secondary
          loading={loading}
          onClick={() => {
            updateChecklist({
              variables: {
                attributes: {
                  onboardingChecklist: {
                    status: OnboardingChecklistState.New,
                  },
                },
              },
              onCompleted: refetch,
            })
          }}
        >Restart
        </Button>
        <Button
          small
          loading={loading}
          onClick={() => updateChecklist({
            variables: {
              attributes: {
                onboardingChecklist: {
                  dismissed: true,
                },
              },
            },
            onCompleted: refetch,
          })}
        >Complete
        </Button>
      </Flex>
    </Flex>
  )
}
