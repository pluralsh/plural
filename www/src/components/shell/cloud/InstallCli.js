import { useContext } from 'react'
import { P } from 'honorable'
import { ArrowTopRightIcon, Button } from 'pluralsh-design-system'

import { CreateShellContext, DemoCard, NavSection } from '../CloudShell'

export default function InstallCli() {
  const { previous, next } = useContext(CreateShellContext)

  return (
    <>
      <DemoCard title="Install Plural CLI">
        <P
          body1
          color="text-light"
          marginBottom="large"
        >
          Our <strong>Quickstart (CLI)</strong> documentation will bring you through the flow to get started on your local machine. After you’re done, move on to the next step to experience the rest of what Plural has to offer.
        </P>
        <Button
          width="100%"
          endIcon={<ArrowTopRightIcon size={24} />}
          onClick={() => {
            window.open('https://docs.plural.sh/quickstart/getting-started')
          }}
        >
          Read the documentation
        </Button>
      </DemoCard>
      <NavSection>
        <Button
          secondary
          onClick={() => previous()}
        >
          Back
        </Button>
        <Button
          secondary
          onClick={() => next()}
        >Continue
        </Button>
      </NavSection>
    </>
  )
}
