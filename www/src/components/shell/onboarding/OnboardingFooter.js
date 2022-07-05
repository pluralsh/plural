import { A, Flex } from 'honorable'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'

import { UPDATE_USER } from '../../users/queries'
import { OnboardingStatus } from '../../profile/types'

function OnboardingFooter() {
  const navigate = useNavigate()
  const [mutation] = useMutation(UPDATE_USER, {
    variables: { attributes: { onboarding: OnboardingStatus.ONBOARDED } },
  })

  function addExternalLink(to, label) {
    return (
      <A
        href={to}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </A>
    )
  }

  function skipDemo() {
    mutation().then(navigate('/'))
  }

  return (
    <Flex
      gap="xlarge"
      justify="center"
      padding="xlarge"
      fontFamily="Monument Semi-Mono, monospace"
      fontWeight={500}
    >
      {addExternalLink('https://discord.gg/pluralsh', 'Support')}
      {addExternalLink('https://github.com/pluralsh/plural', 'GitHub')}
      {addExternalLink('https://docs.plural.sh/', 'Docs')}
      <A
        fontFamily="Monument Semi-Mono, monospace"
        fontWeight={500}
        onClick={skipDemo}
      >
        Skip demo
      </A>
    </Flex>
  )
}

export default OnboardingFooter
