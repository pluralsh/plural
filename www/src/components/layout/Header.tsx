import { Div, Flex, Img } from 'honorable'
import { ArrowTopRightIcon, Button } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

const APP_ICON = '/app-logo-white.png'

export default function Header() {
  const theme = useTheme()

  return (
    <Div
      backgroundColor={theme.colors['fill-one']}
      borderBottom="1px solid border"
    >
      {/* <DemoBanner /> */}
      <Flex
        align="center"
        gap="medium"
        paddingHorizontal="large"
        paddingVertical="xsmall"
      >
        <Img
          height={24}
          marginLeft={-2} /* Optically center with sidebar buttons */
          src={APP_ICON}
          alt="Plural app"
        />
        <Flex grow={1} />
        <Button
          small
          tertiary
          fontWeight={600}
          endIcon={<ArrowTopRightIcon size={14} />}
          as="a"
          href="https://app.plural.sh"
          target="_blank"
          rel="noopener noreferrer"
        >
          Plural App
        </Button>
      </Flex>
    </Div>
  )
}
