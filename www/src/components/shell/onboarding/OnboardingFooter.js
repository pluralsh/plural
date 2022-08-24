import { A, Flex } from 'honorable'
import { useNavigate } from 'react-router-dom'

import { Button } from 'pluralsh-design-system'

import { useOnboarded } from './useOnboarded'

function OnboardingFooter() {
  const navigate = useNavigate()
  const { mutation } = useOnboarded()

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
    mutation().then(() => navigate('/marketplace'))
  }

  return (
    <Flex
      gap="xlarge"
      justify="center"
      align="center"
      padding="xlarge"
      fontFamily="Monument Semi-Mono, monospace"
      fontWeight={500}
    >
      {addExternalLink('https://discord.gg/pluralsh', 'Support')}
      {addExternalLink('https://github.com/pluralsh/plural', 'GitHub')}
      {addExternalLink('https://docs.plural.sh/', 'Docs')}
      <Button
        secondary
        onClick={skipDemo}
      >
        Skip demo
      </Button>
    </Flex>
  )
}

export default OnboardingFooter
