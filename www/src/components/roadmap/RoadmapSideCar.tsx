import {
  Button,
  Div,
  Flex,
  P,
} from 'honorable'
import {
  ArrowTopRightIcon,
  CertificateIcon,
  DiscordIcon,
  GitHubLogoIcon,
} from '@pluralsh/design-system'

function RoadmapSideCar(props: any) {
  return (
    <Div
      position="relative"
      width={200}
      paddingTop="medium"
      {...props}
    >
      <Button
        secondary
        as="a"
        target="_blank"
        href="https://github.com/pluralsh/plural/issues"
        endIcon={(<ArrowTopRightIcon />)}
      >
        Roadmap request
      </Button>
      <Div
        marginTop="large"
        border="1px solid border"
        borderRadius="large"
        padding="medium"
      >
        <P
          overline
          color="text-xlight"
          wordBreak="break-word"
        >
          Plural resources
        </P>
        <Flex
          marginTop="medium"
          width="100%"
          direction="column"
          align="flex-start"
        >
          <Button
            small
            tertiary
            as="a"
            target="_blank"
            href="https://docs.plural.sh"
            width="100%"
            justifyContent="flex-start"
            startIcon={(
              <CertificateIcon />
            )}
          >
            Docs
          </Button>
          <Button
            small
            tertiary
            as="a"
            target="_blank"
            href="https://discord.gg/pluralsh"
            width="100%"
            justifyContent="flex-start"
            startIcon={(
              <DiscordIcon />
            )}
          >
            Discord
          </Button>
          <Button
            small
            tertiary
            as="a"
            target="_blank"
            href="https://github.com/pluralsh"
            width="100%"
            justifyContent="flex-start"
            startIcon={(
              <GitHubLogoIcon />
            )}
          >
            GitHub
          </Button>
        </Flex>
      </Div>
    </Div>
  )
}

export default RoadmapSideCar
