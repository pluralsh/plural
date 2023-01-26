import { Div, Flex, Img } from 'honorable'
import { ArrowTopRightIcon, Button, Tooltip } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

const APP_ICON = '/app-logo-white.png'

export default function Header() {
  const theme = useTheme()

  // TODO: Figure out how to get console link
  const consoleLink = ''

  let consoleButton = (
    <Button
      small
      endIcon={<ArrowTopRightIcon size={14} />}
      {...(consoleLink
        ? {
          as: 'a',
          href: consoleLink,
          target: '_blank',
          rel: 'noopener noreferrer',
        }
        : { disabled: true })}
    >
      Launch Console
    </Button>
  )

  if (!consoleLink) {
    consoleButton = (
      <Tooltip
        placement="bottom-end"
        label={(
          <>
            You must have Plural Console
            <br />
            deployed to access your console.
          </>
        )}
      >
        <div>{consoleButton}</div>
      </Tooltip>
    )
  }

  return (
    <Div
      backgroundColor={theme.colors['fill-one']}
      borderBottom="1px solid border"
      paddingHorizontal="large"
      paddingVertical="xsmall"
    >
      <Flex
        align="center"
        gap="medium"
        minHeight={40}
      >
        <Img
          height={24}
          marginLeft={-2} /* Optically center with sidebar buttons */
          src={APP_ICON}
          alt="Plural app"
        />
        <Flex grow={1} />
        {consoleButton}
      </Flex>
    </Div>
  )
}
